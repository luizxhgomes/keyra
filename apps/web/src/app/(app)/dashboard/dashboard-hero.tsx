import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  displayName: string;
  subtitle?: string;
}

/**
 * Hero do dashboard — saudação editorial em Fraunces.
 * Inspirado em: dashboard reference ("Hello, Alex! / Teacher").
 *
 * Adaptação Editorial Beauty Luxury:
 * - Saudação em Fraunces grande (não Inter)
 * - Subtítulo com data atual em pt-BR
 * - Sem ícones de notificação/busca aqui (já vivem no AppShell header)
 */
export function DashboardHero({ displayName, subtitle }: Props) {
  const today = new Date();
  const dateLabel = format(today, "EEEE, d 'de' MMMM", { locale: ptBR });
  const greeting = getTimeBasedGreeting();
  const firstName = displayName.split(' ')[0] || displayName;

  return (
    <header className="flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {dateLabel}
      </p>
      <h1 className="font-serif text-display font-light leading-tight tracking-tight text-foreground">
        {greeting}, <span className="text-cocoa-900">{firstName}</span>.
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </header>
  );
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
