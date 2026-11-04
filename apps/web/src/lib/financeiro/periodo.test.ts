import { describe, expect, it } from 'vitest';

import { buildComparativo } from './comparativo';
import { formatPeriodoComparado, taxaComparecimento, ticketMedioCents } from './periodo';

describe('formatPeriodoComparado', () => {
  it('nomeia o intervalo do mês anterior', () => {
    expect(formatPeriodoComparado('2026-10-01', '2026-10-04')).toBe('de 1 a 4 de outubro');
  });

  it('usa "em 1º" no primeiro dia do mês', () => {
    expect(formatPeriodoComparado('2026-10-01', '2026-10-01')).toBe('em 1º de outubro');
  });

  it('respeita o fim do mês anterior mais curto', () => {
    expect(formatPeriodoComparado('2026-02-01', '2026-02-28')).toBe('de 1 a 28 de fevereiro');
    expect(formatPeriodoComparado('2028-02-01', '2028-02-29')).toBe('de 1 a 29 de fevereiro');
  });

  it('não sofre deslocamento de fuso (não passa por Date)', () => {
    expect(formatPeriodoComparado('2026-12-01', '2026-12-31')).toBe('de 1 a 31 de dezembro');
  });

  it('recusa data malformada', () => {
    expect(() => formatPeriodoComparado('2026-10-1', '2026-10-04')).toThrow();
  });
});

describe('ticketMedioCents', () => {
  it('divide e arredonda com ROUND_HALF_EVEN', () => {
    // 1001 / 2 = 500,5 → 500 (par mais próximo)
    expect(ticketMedioCents(1001, 2)).toBe(500);
    // 1003 / 2 = 501,5 → 502
    expect(ticketMedioCents(1003, 2)).toBe(502);
    // 30100 / 2 = 15050 exato
    expect(ticketMedioCents(30100, 2)).toBe(15050);
  });

  it('é zero sem comandas pagas', () => {
    expect(ticketMedioCents(0, 0)).toBe(0);
  });

  it('não acumula erro de float em valores grandes', () => {
    // 3 × R$ 33.333,33 = R$ 99.999,99
    expect(ticketMedioCents(9_999_999, 3)).toBe(3_333_333);
  });
});

describe('taxaComparecimento', () => {
  it('calcula realizados ÷ fechados em %', () => {
    expect(taxaComparecimento(1, 2)).toBe(50);
    expect(taxaComparecimento(2, 2)).toBe(100);
  });

  it('é zero sem atendimentos fechados', () => {
    expect(taxaComparecimento(0, 0)).toBe(0);
  });
});

describe('buildComparativo com o mesmo período', () => {
  it('reproduz o caso de 04/11: novembro parcial contra 1 a 4 de outubro', () => {
    // Valores do teste SQL dashboard_period_comparison.test.sql
    const lucroAtual = 120000 - 41040;
    const lucroAnterior = 313555 - 300000;
    const comp = buildComparativo(lucroAtual, lucroAnterior, 'de 1 a 4 de outubro', 'revenue');
    expect(comp).toEqual({ delta: 65405, period: 'de 1 a 4 de outubro', sentiment: 'positive' });
  });

  it('sem histórico nos dois lados não mostra comparativo', () => {
    expect(buildComparativo(0, 0, 'em 1º de outubro', 'revenue')).toBeNull();
  });
});
