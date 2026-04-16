# Formatos de Documentos — KEYRA

## Extratos Bancários

### OFX (Open Financial Exchange)
- **Encoding:** ISO-8859-1 (maioria) ou UTF-8
- **Estrutura:** XML-like com tags `<STMTTRN>`
- **Campos:** `<DTPOSTED>`, `<TRNAMT>`, `<NAME>`, `<MEMO>`, `<FITID>`
- **Data:** AAAAMMDD (ex: 20260315)
- **Valor:** Ponto como decimal (ex: -150.00)
- **Bancos que exportam:** Itaú, Bradesco, BB, Santander, Caixa

### CSV Bancário
- **Encoding:** UTF-8 ou ISO-8859-1 (variam por banco)
- **Separador:** Ponto-e-vírgula (;) na maioria dos bancos BR
- **Campos comuns:** data, descrição, valor, saldo
- **Data:** DD/MM/AAAA (padrão BR)
- **Valor:** Vírgula como decimal (1.234,56)
- **Atenção:** Header varia por banco — identificar pelo padrão

### PDF Bancário
- **Texto extraível:** Maioria dos bancos grandes (Itaú, Bradesco, BB)
- **Imagem escaneada:** Alguns extratos impressos → precisa OCR
- **Layout:** Varia por banco — parser específico necessário
- **Encoding:** UTF-8 no texto extraído

## Extratos de Maquininhas

### CSV de Operadora
- **Encoding:** UTF-8 (maioria)
- **Separador:** Vírgula (,) ou ponto-e-vírgula (;)
- **Campos comuns:** data venda, valor bruto, taxa, valor líquido, bandeira, parcelas
- **Data:** DD/MM/AAAA
- **Valor:** Vírgula como decimal
- **Período:** Geralmente relatório mensal ou por período

### PDF de Operadora
- **Texto extraível:** Stone, PagSeguro, Mercado Pago (relatórios digitais)
- **Layout:** Tabular — extrair com parsing de tabelas
- **Atenção:** Relatórios resumidos vs detalhados (preferir detalhados)

## Regras de Parsing

1. **Sempre detectar encoding** antes de processar (chardet)
2. **Sempre normalizar datas** para AAAA-MM-DD internamente
3. **Sempre converter valores** para centavos inteiros
4. **Sempre atribuir score de confiança** (0-100) por transação
5. **Nunca logar** conteúdo bruto do documento (PII)
