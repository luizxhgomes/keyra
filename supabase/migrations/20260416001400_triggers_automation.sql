-- =============================================================================
-- KEYRA — Migration 014: Critical Automation Triggers
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: The CORE automations that make "operation drives finance" a reality.
-- Traceability: ADR-013 triggers block (appointment→command, payment→transaction,
--               command.done→inventory_movement), CON-KE-02 (automação máxima).
--
-- All triggers are defense-in-depth: even if a Server Action is bypassed, the DB
-- maintains invariants.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TRIGGER 1: appointments.status → 'done' creates commands + command_items
--            (snapshot service price/cost/commission)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_appointment_done_creates_command()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
DECLARE
  v_service       public.services%ROWTYPE;
  v_professional  public.professionals%ROWTYPE;
  v_command_id    uuid;
  v_commission    numeric(5,4);
BEGIN
  -- Only act when status transitions TO 'done'
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN

    -- Avoid duplicate comanda if one already exists for this appointment
    IF EXISTS (SELECT 1 FROM public.commands WHERE appointment_id = NEW.id) THEN
      NEW.done_at := COALESCE(NEW.done_at, now());
      RETURN NEW;
    END IF;

    SELECT * INTO v_service
      FROM public.services
     WHERE id = NEW.service_id AND org_id = NEW.org_id;

    SELECT * INTO v_professional
      FROM public.professionals
     WHERE id = NEW.professional_id AND org_id = NEW.org_id;

    -- Commission precedence: service.commission_rate > professional.default > 0
    v_commission := COALESCE(v_service.commission_rate, v_professional.default_commission_rate, 0);

    -- Create the command
    INSERT INTO public.commands (org_id, appointment_id, customer_id, professional_id,
                                 status, subtotal, discount_amount,
                                 opened_at, created_by)
    VALUES (NEW.org_id, NEW.id, NEW.customer_id, NEW.professional_id,
            'open', 0, 0,
            now(), NEW.created_by)
    RETURNING id INTO v_command_id;

    -- Snapshot line item
    INSERT INTO public.command_items (org_id, command_id, service_id, professional_id,
                                      description, quantity, unit_price, unit_cost,
                                      commission_rate, discount_amount)
    VALUES (NEW.org_id, v_command_id, v_service.id, NEW.professional_id,
            v_service.name, 1, NEW.price_snapshot, v_service.unit_cost,
            v_commission, 0);

    -- Update appointment lifecycle
    NEW.done_at := COALESCE(NEW.done_at, now());
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trg_appointment_done_creates_command() IS
  'KEYRA FR-AG-06 / FR-CO-01 / CON-KE-02: auto-generate comanda when appointment=done.';

CREATE TRIGGER trg_appointments_done_to_command
  BEFORE UPDATE OF status ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.trg_appointment_done_creates_command();

-- -----------------------------------------------------------------------------
-- TRIGGER 2: payments INSERT → transactions INSERT (1:1) + command state update
--            + inventory_movements (rateio de insumos when payment finalizes)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_payment_creates_transaction()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
DECLARE
  v_command       public.commands%ROWTYPE;
  v_transaction_id uuid;
  v_total_paid    numeric(14,2);
  v_revenue_cat   uuid;
BEGIN
  SELECT * INTO v_command
    FROM public.commands
   WHERE id = NEW.command_id AND org_id = NEW.org_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Command % not found for org %', NEW.command_id, NEW.org_id;
  END IF;

  -- Pick the default revenue category (first active one with kind='revenue')
  SELECT id INTO v_revenue_cat
    FROM public.expense_categories
   WHERE org_id = NEW.org_id
     AND kind = 'revenue'
     AND deleted_at IS NULL
     AND active = true
   ORDER BY is_default DESC, sort_order ASC, created_at ASC
   LIMIT 1;

  -- Create the transaction (FR-FI-01)
  INSERT INTO public.transactions (org_id, account_id, expense_category_id, professional_id,
                                   customer_id, direction, gross_amount, fee_amount, net_amount,
                                   origin, description, reference_date, settled_at,
                                   source_type, source_id, created_by)
  VALUES (NEW.org_id, NEW.account_id, v_revenue_cat, v_command.professional_id,
          v_command.customer_id, 'credit', NEW.gross_amount, NEW.fee_amount, NEW.net_amount,
          'command_payment',
          'Comanda #' || substring(v_command.id::text, 1, 8),
          (NEW.paid_at AT TIME ZONE 'America/Sao_Paulo')::date,
          NEW.settled_at,
          'payment', NEW.id, NEW.created_by)
  RETURNING id INTO v_transaction_id;

  NEW.transaction_id := v_transaction_id;

  -- Update the command: paid_amount and status
  UPDATE public.commands c
     SET paid_amount = c.paid_amount + NEW.gross_amount,
         status = CASE
           WHEN (c.paid_amount + NEW.gross_amount) >= c.total THEN 'paid'
           WHEN c.status = 'open' THEN 'finalized'
           ELSE c.status
         END,
         paid_at = CASE
           WHEN (c.paid_amount + NEW.gross_amount) >= c.total THEN now()
           ELSE c.paid_at
         END,
         finalized_at = CASE
           WHEN c.status = 'open' THEN now()
           ELSE c.finalized_at
         END,
         updated_at = now()
   WHERE c.id = v_command.id;

  -- If command is now paid → register inventory consumption (rateio insumos)
  SELECT total, paid_amount INTO v_command.total, v_total_paid
    FROM public.commands WHERE id = v_command.id;

  IF v_total_paid >= v_command.total THEN
    PERFORM public._consume_command_inventory(v_command.id, NEW.org_id, NEW.created_by);
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trg_payment_creates_transaction() IS
  'KEYRA FR-FI-01 / ADR-013 #3: 1 payment → 1 transaction + updates command + rateio insumos.';

CREATE TRIGGER trg_payments_to_transaction
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.trg_payment_creates_transaction();

-- -----------------------------------------------------------------------------
-- Helper: consume inventory based on command_items × service_supplies
-- Called once per command when it transitions to 'paid'.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._consume_command_inventory(
  p_command_id uuid,
  p_org_id     uuid,
  p_created_by uuid
)
  RETURNS void
  LANGUAGE plpgsql
AS $$
DECLARE
  r_item RECORD;
BEGIN
  FOR r_item IN
    SELECT ss.supply_id,
           ss.quantity * ci.quantity AS consumed_quantity,
           s.unit_cost               AS unit_cost_at_move
      FROM public.command_items ci
      JOIN public.service_supplies ss ON ss.service_id = ci.service_id
      JOIN public.supplies s          ON s.id = ss.supply_id
     WHERE ci.command_id = p_command_id
       AND ci.org_id     = p_org_id
  LOOP
    INSERT INTO public.inventory_movements
      (org_id, supply_id, movement_type, quantity, unit_cost_at_move,
       source_type, source_id, notes, created_by)
    VALUES (p_org_id, r_item.supply_id, 'service_consumption',
            -r_item.consumed_quantity, r_item.unit_cost_at_move,
            'command', p_command_id,
            'Auto-rateio por comanda paga', p_created_by);
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public._consume_command_inventory(uuid, uuid, uuid) IS
  'KEYRA FR-ES-02: baixa insumos do estoque quando comanda é paga (rateio automático).';
