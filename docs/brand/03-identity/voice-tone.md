# Voz e Tom — KEYRA

> **Status:** v1.0 — destilado em 2026-05-07.
> **Persona-target:** mulheres empreendedoras donas de clínica de estética. Não-financistas. Tocam o negócio entre atendimentos.
> **Tom-norte:** **mentora confiável.** Não fria, não maternal, não técnica.

---

## 1. Documentação relacionada (não duplicar)

A operação tática de copy de UI já vive em [`docs/ux/copy-guidelines.md`](../../ux/copy-guidelines.md), com:
- Tabela de tradução técnico → humano
- Padrões de mensagem (toast, erro, empty state, confirmação destrutiva)
- Regras pt-BR inegociáveis (acentuação, datas, moeda, plurais)

Este documento (`voice-tone.md`) é a **camada de marca** acima dela: define a voz como personagem, com 4 estados, antes de descer para o copy.

---

## 2. A KEYRA como pessoa

Se a KEYRA fosse uma pessoa, seria:

- Mulher, 35-45 anos
- Empresária bem-sucedida que **viveu o problema** que resolve (já teve clínica, virou madrugada com planilha)
- Veste-se com elegância contida (look uniforme, peças bem cortadas, ouro discreto)
- Fala pt-BR culto mas direto — não é executiva engravatada, não é coach motivacional
- Sabe o nome do contador e o que ele cobra
- Não vende sonho — vende **alívio com prova**
- Quando elogia, é específica ("o seu mês foi 14% melhor que abril, parabéns") — nunca "incrível", "amazing", "show!"

**Anti-pessoa:** influencer beauty, coach financeira, atendente de banco, tech-bro de SaaS, mãe que protege.

---

## 3. Os 4 estados de voz

A voz é **uma**, mas modula em 4 estados conforme o contexto.

### 3.1. **Mentora** (default — todo dia)
**Quando:** body de produto, dashboard, mensagens de status, dicas de uso.
**Tom:** sereno, claro, com leve calor.
**Exemplo:**
> ✅ "Sua clínica fez R$ 2.300 a mais que abril."
> ❌ "Receita de Maio: 12.847,30 (acima do mês anterior)."

### 3.2. **Cúmplice** (quando a Camila está fazendo certo)
**Quando:** sucesso, acerto, conquista, marco.
**Tom:** discreta, específica, nunca eufórica.
**Exemplo:**
> ✅ "Comanda fechada. R$ 850 entraram agora."
> ❌ "Boa! 💰 Você arrasou! 🎉"

### 3.3. **Direta** (quando há um problema)
**Quando:** erro, conta atrasada, meta não batida, decisão pendente.
**Tom:** firme sem ser dura, oferece o próximo passo.
**Exemplo:**
> ✅ "Sua margem caiu 8% este mês. Veja onde ajustar →"
> ❌ "⚠️ ATENÇÃO! Margem em queda. Tome providências imediatamente."

### 3.4. **Editorial** (quando vai pro palco — marketing/brand)
**Quando:** capa, hero, sales page, post Instagram, proposta comercial.
**Tom:** elegante, breve, dramatizado, serif gigante.
**Exemplo:**
> ✅ "Sua clínica *rendendo mais*. Sem planilha. Sem domingo perdido. Sem achismo."
> ❌ "A KEYRA é uma plataforma de gestão financeira que ajuda donas de clínicas a aumentar o lucro através de automação."

---

## 4. Princípios de voz

| Princípio | O que significa | Exemplo |
|-----------|----------------|---------|
| **Concreto > abstrato** | Sempre número, sempre nome, sempre data | "R$ 2.300 a mais" > "uma melhora considerável" |
| **Ela > ela é** | Ação no presente. Sujeito é a Camila ou a clínica | "Sua clínica fez X" > "Foi feito X pela clínica" |
| **Pt-BR culto direto** | Não usa estrangeirismo desnecessário, mas não tem medo de termo brasileiro do contador | "DRE", "comissão", "MEI", "Simples" — naturais |
| **Sem motivacional vazio** | Zero "você consegue!", "vamos juntos!", "rumo ao sucesso!" | Use prova: "+R$ 2.300", "−12 horas", "3 dias atrás" |
| **Sem técnico desnecessário** | Tradução técnico → humano (ver copy-guidelines) | "comanda paga" > "transação status=paid" |
| **Voz na primeira pessoa do plural só em momentos brand** | "Acreditamos que..." é editorial. UI usa "você"/"sua" | UI: "Sua receita do mês"; Brand: "Acreditamos que sua clínica merece..." |

---

## 5. O que dizer / o que evitar

### Vocabulário que reforça a marca

✅ **Usar:**
- "sua clínica", "sua receita", "seu lucro" (segunda pessoa direta)
- "alívio", "controle", "clareza", "domingo livre"
- "lucro real", "dinheiro que entrou", "o que sobrou"
- "comissão", "comanda", "movimento", "lançamento"
- "decisão", "ajuste", "previsto vs realizado"
- "essa semana", "este mês" — referências temporais humanas

### Vocabulário a evitar

❌ **Não usar:**
- "amigaaa", "amooor", "linda", "querida" (informal beauty industry)
- "bombar", "explodir", "destravar", "alavancar" (coach financeira)
- "incrível", "amazing", "show", "top" (entusiasmo vazio)
- "transação", "registro", "instância", "entidade" (técnico cru)
- "estamos com você", "vamos juntos", "rumo ao sucesso" (motivacional vazio)
- "exclusivo", "premium", "VIP" (vendido demais — KEYRA é quiet luxury, não shopping)
- "fácil", "rapidinho", "simples assim" (subestima a Camila)
- Emoji em UI — só em onboarding/marketing pontual; nunca em mensagem operacional

---

## 6. Aplicação por touchpoint

| Touchpoint | Estado de voz | Família tipográfica dominante |
|------------|--------------|-------------------------------|
| Dashboard (KPIs, valores) | Mentora | Sans (Inter) — números protagonistas |
| Tooltip / helper text | Mentora | Sans (Inter) |
| Toast de sucesso | Cúmplice | Sans (Inter) |
| Toast de erro | Direta | Sans (Inter) |
| Empty state | Mentora (calorosa) | Mistura (serif título + sans body) |
| Onboarding (primeiros passos) | Mentora (didática) | Mistura |
| Email transacional | Mentora | Mistura |
| Email de marketing | Editorial | Serif (Fraunces) |
| Hero de sales page | Editorial | Serif (Fraunces 200/700) |
| Capa de proposta comercial | Editorial | Serif (Fraunces) |
| Post Instagram | Editorial | Serif (Fraunces) gigante |
| Suporte por chat/email | Mentora + cúmplice | Sans |
| Mensagem de billing/cobrança | Direta (firme + respeitosa) | Sans |

---

## 7. 10 frases-padrão por contexto

### Dashboard / status
1. "Sua clínica fez {valor} este mês."
2. "{Valor} a mais que {período anterior}."
3. "Faltam {n} dias para fechar o mês."
4. "{N} comandas abertas precisam de pagamento."
5. "Sua margem ficou em {%} este mês."

### Sucesso (cúmplice)
6. "Comanda fechada. {Valor} entraram agora."
7. "Atendimento concluído. Comanda gerada."
8. "Cadastro salvo."

### Erro (direta)
9. "Algo travou aqui. Pode tentar de novo? Se persistir, [detalhe técnico]."

### Empty state (mentora calorosa)
10. "Você ainda não tem {recurso}. Cadastre {seu/sua primeiro/primeira} {item} para começar a ver {benefício concreto}."

---

## 8. Anti-exemplos reais (e a correção)

| ❌ Anti-exemplo | ✅ Correção |
|----------------|------------|
| "Olá! Bem-vinda à KEYRA, sua nova parceira de gestão financeira!" | "Bem-vinda. Vamos cadastrar sua primeira cliente." |
| "🎉 Sua receita explodiu este mês!" | "+R$ 2.300 que abril. Seu melhor mês até aqui." |
| "Status updated successfully." | "Pagamento registrado. Comanda fechada." |
| "Por favor, configure suas integrações antes de utilizar essa funcionalidade." | "Você ainda não conectou {X}. Conectar agora →" |
| "Atenção! Você possui 3 contas vencidas que totalizam R$ 1.245,00." | "3 contas venceram. Total: R$ 1.245. Ver detalhes →" |
| "A KEYRA revoluciona a gestão financeira de clínicas de estética com inteligência artificial e automação inteligente." | "A clínica vira financeiro sozinha. Você decide com clareza." |

---

_Para regras táticas de copy de UI (toast, erro, empty state), consulte [`docs/ux/copy-guidelines.md`](../../ux/copy-guidelines.md). Para narrativa de marca (manifesto, movimento), consulte [`04-activate/`](../04-activate/) (a produzir)._
