# KEYRA — Visao da Idealizadora

> Transcrição e síntese de 4 áudios gravados pela idealizadora do projeto KEYRA.
> Data: 2026-04-12

---

## Transcrições Completas

### Audio 1 — Dashboard e Controle Financeiro

Sim eu quero que ele controle toda a parte de entradas e saídas financeiras, para que ele faça esse controle que tenha upload de documentos em PDF, por exemplo o extrato bancário extrato da maquininha de cartão, qualquer coisa desse gênero que para fazer também a parte de análise. Ele vai levar em consideração os custos e as receitas, mas também vai fazer projeção de lucro, projeção de preço, projeção de pacotes de serviços, enfim que ela vai fazer então é toda uma união. E aí eu queria um dashboard de acompanhamento para que ela pudesse olhar os resultados dela tipo numa única tela. Não gosto muito de gráficos propriamente dito. Eu queria mais números absolutos, sabe números assim, a quanto você está tendo de receita esse mês frente ao último mês. Você está com tanto de diferença frente à meta que a gente projetou para ti, você está com tanto de diferença, sabe sem muitos gráficos, que eu acho que de um modo geral as pessoas não gostam, não gostam não, elas não sabem ler gráficos.

### Audio 2 — Estrutura de Custos e Receitas

Por trás dos bastidores, as contas vão ser mais ou menos assim, entrada de dinheiro, se ela vem de produtos e serviços, entradas separadas para cada uma dessas coisas. Se ela tem mais de um profissional dentro do estúdio dela, dentro do consultório dela, também as receitas por separados por profissionais ou por grandes centros de custo. Quando a gente vai falar de custos também, o que é custo fixo, o que é custo variável, o que é aquele custo, qual é o impacto dele ali dentro. Dependendo do custo variável, ele vai compor um pedaço da precificação dela. Então tem todas essas vertentes de variáveis, todos esses cálculos e tudo eu posso passar para você depois.

### Audio 3 — Diferencial: Alem do Controle Financeiro

O ponto é que eu não quero ser somente um controle financeiro eu quero ser algo além do controle financeiro. Um controle financeiro só mostra quais são as entradas e saídas, por exemplo que a gente tem no Conta Azul, vou te mandar o link do Conta Azul para você olhar, lá só tem entradas e saídas e uma breve análise demonstrativa de resultado, coisas assim. Eu quero ir além porque o Conta Azul não faz precificação, então eu quero que a partir dos custos que ela imputar no sistema que a gente consiga fazer a precificação dela lá com margem de lucratividade e tudo mais. Além disso eu quero que na parte de análises, quando ela for fazer a análise, que a gente já consiga gerar para ela panoramas muito claros para a construção das metas dela. E aí é quando vai entrar o meu trabalho como mentora financeira que é para ajustar essas metas.

### Audio 4 — Integração Agenda + Financeiro + Estoque

Além disso, a receita que ela tiver deve estar conciliada com a agenda dela. Então, se a gente tiver um módulo ali dentro, que é um módulo de agenda, onde ela vai agendar essas pacientes dela, ali ela vai agendar. Ah, quem vai falar vai ser a Thaís, a Thaís veio para fazer Botox. Então a gente já sabe que a paciente é Thaís e ela vai fazer o Botox. Então ele já puxaria qual é o custo para fazer aquele Botox, qual vai ser o preço cobrado e aí ele já vai rateando essas informações. Quando a Thaís pagar para essa profissional, isso já vai entrar em receita. Você entende que vai cruzando uma informação na outra? Então ele vai controlando, vou colocar aqui entre aspas ou não, vai controlando o estoque, vai controlando a parte de entrada financeira, vai controlando o fluxo de caixa dela, vai controlando também a parte de custos que ela tem, sabe? Toda uma ligação.

---

## Sintese da Visao do Projeto KEYRA

### O que e o KEYRA

Um sistema financeiro operacional voltado para profissionais de estetica (clinicas, studios, consultorios) que vai **alem de um simples controle financeiro**. O diferencial e a integração entre agenda de atendimentos, financeiro, precificação e análise de metas — tudo conectado.

### Concorrente Referenciado

**Conta Azul** — considerado limitado porque so faz entradas/saidas e DRE basica. Não faz precificação, não integra com agenda, não gera panoramas de metas.

### Modulos Principais Identificados

| Modulo | Funcionalidade |
|--------|---------------|
| **Controle Financeiro** | Entradas e saidas, separadas por produtos vs serviços, por profissional e por centro de custo |
| **Upload de Documentos** | Upload de PDFs (extratos bancarios, extratos de maquininha) para alimentar o sistema |
| **Custos** | Classificação de custo fixo vs variavel, impacto de cada custo, composição para precificação |
| **Precificação** | A partir dos custos imputados, calcular preço de venda com margem de lucratividade |
| **Projeções** | Projeção de lucro, projeção de preço, projeção de pacotes de serviços |
| **Agenda** | Agendamento de pacientes + serviço que será realizado, puxando automaticamente custo e preço |
| **Controle de Estoque** | Rateio automatico de insumos conforme agendamentos realizados |
| **Dashboard** | Tela unica com numeros absolutos (não graficos), comparativos mês atual vs anterior, diferença frente a metas |
| **Analises e Metas** | Panoramas claros para construção de metas (complemento ao trabalho da mentora financeira) |

### Fluxo Central — "Toda uma ligação"

```
AGENDA (paciente + servico)
   ↓ puxa automaticamente
CUSTO do procedimento + PRECO cobrado
   ↓ quando paciente paga
RECEITA registrada por profissional
   ↓ rateia
ESTOQUE atualizado + FLUXO DE CAIXA alimentado
   ↓ gera
DASHBOARD com numeros absolutos + ANALISES para metas
```

### Principios de UX da Idealizadora

1. **Numeros absolutos, não graficos** — "as pessoas não sabem ler gráficos"
2. **Comparativos claros** — receita deste mês vs mês anterior, diferença frente à meta
3. **Tela unica** — dashboard que mostra tudo de uma vez
4. **Simplicidade** — a profissional de estetica precisa entender sem ser financista

### Papel da Idealizadora

Mentora financeira para profissionais de estetica. O KEYRA e a ferramenta que suporta o trabalho de mentoria — o sistema gera os panoramas e metas, a mentora ajusta junto com a cliente.

### Perfil da Usuaria Final

- Profissional de estetica (esteticista, dentista, dermatologista)
- Pode ter studio/consultorio com mais de um profissional
- Trabalha com produtos e serviços
- Não tem familiaridade com termos financeiros complexos ou leitura de graficos
