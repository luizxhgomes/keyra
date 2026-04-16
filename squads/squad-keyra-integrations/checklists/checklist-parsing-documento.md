# Checklist de Parsing de Documento — KEYRA

## Upload e Validação

- [ ] MIME type validado antes de aceitar
- [ ] Tamanho máximo aplicado (configurável)
- [ ] Verificação de duplicata (hash SHA-256)
- [ ] Documento armazenado criptografado
- [ ] PII não logada durante upload

## Extração

- [ ] Encoding detectado automaticamente (ISO-8859-1 vs UTF-8)
- [ ] Formato identificado corretamente (OFX, CSV, PDF)
- [ ] Parser correto selecionado (banco/operadora específico)
- [ ] Se PDF sem texto → OCR acionado automaticamente
- [ ] Score de confiança atribuído por transação (0-100)

## Transformação de Dados

- [ ] Datas normalizadas para AAAA-MM-DD
- [ ] Valores convertidos para centavos inteiros
- [ ] Formato brasileiro tratado (1.234,56 → 123456)
- [ ] Sinal correto (crédito positivo, débito negativo)
- [ ] Descrição preservada (não truncar)

## Categorização

- [ ] Descrição mapeada para categoria KEYRA
- [ ] Categorias desconhecidas marcadas como "Não categorizada"
- [ ] Score de confiança da categorização incluído

## Revisão Humana

- [ ] Transações com confiança < 80% vão para revisão
- [ ] Tela de revisão mostra documento original ao lado
- [ ] Campos editáveis: data, descrição, valor, categoria
- [ ] Confirmação atualiza confiança para 100%

## Reconciliação

- [ ] Matching por data + valor funciona corretamente
- [ ] Tolerância de data (±2 dias) considerada
- [ ] Taxas de maquininha tratadas (bruto vs líquido)
- [ ] Duplicatas detectadas e rejeitadas
- [ ] Transações novas importáveis

## Segurança

- [ ] Conteúdo do documento nunca logado
- [ ] CPF, conta bancária mascarados em qualquer output
- [ ] Documento original acessível apenas pelo tenant
- [ ] Trilha de auditoria para acesso ao documento
