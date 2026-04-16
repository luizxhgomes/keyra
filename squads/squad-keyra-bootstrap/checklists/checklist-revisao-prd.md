# Checklist de Revisão do PRD — KEYRA

## Validação de Conteúdo

- [ ] **Visão do produto** claramente definida
- [ ] **Problema central** articulado (desconexão entre operação e financeiro)
- [ ] **Diferencial** explicitado (financeiro gerado automaticamente da operação)
- [ ] **4 pilares** documentados (Agenda, Serviços, Financeiro, Inteligência)
- [ ] **12 módulos** listados e descritos

## Requisitos Funcionais (FRs)

- [ ] Cada FR tem identificador único (FR-001, FR-002, ...)
- [ ] Cada FR é testável e verificável
- [ ] FRs cobrem todos os 12 módulos
- [ ] FR de agenda como origem do faturamento
- [ ] FR de comanda automática a partir do atendimento
- [ ] FR de DRE gerada automaticamente
- [ ] FR de lucro por serviço
- [ ] FR de upload e processamento de documentos
- [ ] FR de dashboard com números absolutos

## Requisitos Não Funcionais (NFRs)

- [ ] Performance definida (tempo de resposta, throughput)
- [ ] Segurança especificada (LGPD, criptografia, RLS)
- [ ] Usabilidade com princípios da idealizadora
- [ ] Escalabilidade (multi-tenant, crescimento)
- [ ] Disponibilidade (SLA, uptime)

## Restrições (CONs)

- [ ] CON: Números absolutos, sem gráficos
- [ ] CON: Dashboard de tela única
- [ ] CON: Simplicidade para não financistas
- [ ] CON: Valores monetários em centavos inteiros

## Personas

- [ ] Profissional de estética (operadora do dia a dia)
- [ ] Gestora de clínica (visão financeira)
- [ ] Mentora financeira (análise de rentabilidade)

## Monetização

- [ ] Planos SaaS definidos (Start, Crescimento, Autoridade)
- [ ] Funcionalidades por plano mapeadas
- [ ] Preços de referência documentados

## Qualidade do Documento

- [ ] Linguagem clara e objetiva
- [ ] Sem ambiguidades nos requisitos
- [ ] Rastreabilidade (cada afirmação tem origem)
- [ ] Conformidade com Article IV (No Invention) — sem funcionalidades inventadas
