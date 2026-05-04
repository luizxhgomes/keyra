import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

/**
 * KEYRA Tailwind config.
 *
 * Paleta terracota + verde sálvia conforme `docs/ux/wireframes/00-design-principles.md`.
 * Usa CSS variables HSL definidas em `src/app/globals.css` para suportar dark mode futuro
 * sem reescrever tokens.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#FDF6F1',
          100: '#F9E5D6',
          200: '#F2C9AD',
          300: '#E8A77C',
          400: '#DB8450',
          500: '#C66A38',
          600: '#A8522A',
          700: '#884120',
          800: '#5E2C15',
          900: '#3D1C0D',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#F1F6F2',
          100: '#DDE9DF',
          200: '#B8D3BD',
          300: '#8BB693',
          400: '#5F996A',
          500: '#457A50',
          600: '#365F3F',
          700: '#274530',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Semantic financial states (CON-UX-02 + design-principles §2.3)
        lucro: '#457A50',
        prejuizo: '#B23A3A',
        neutro: '#6B6560',
        alerta: '#D4A341',
        info: '#8A7A6B',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        // Tokens semânticos KEYRA (Story 5.5).
        // Modelados a partir do Gestek (densidade `roomy`) ajustados para
        // dashboard editorial. Documentação: docs/ux/PLANO-SPRINT-5-6.md.
        'card-x': '1.5rem', // 24px — padding lateral interno do Card
        'card-y': '1.5rem', // 24px — padding vertical interno do Card
        'card-x-hero': '2rem', // 32px — padding em KPICard variant=hero
        'card-y-hero': '2rem', // 32px
        'stack-tight': '0.5rem', // 8px — gap entre label + valor
        stack: '1rem', // 16px — gap entre items relacionados em uma lista
        'stack-loose': '1.5rem', // 24px — gap entre items em narrativa (DRE)
        section: '2rem', // 32px — gap entre cards de uma mesma seção
        page: '3rem', // 48px — gap entre seções de página
      },
      fontSize: {
        // Escala tipográfica editorial KEYRA (Story 6.1).
        // Inter Variable com weights extremos (200 display, 600 headings/KPI).
        // Modelada a partir do Gestek + ajustes para sobriedade KEYRA.
        // Sintaxe Tailwind 3.4+: [size, { lineHeight, letterSpacing, fontWeight }]
        // — fontWeight aqui é o DEFAULT quando a classe é aplicada sozinha.
        // Classes utility (font-bold, font-medium) sobrepõem se aplicadas junto.
        'display-hero': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '200' }],
        'display': ['40px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '200' }],
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2': ['24px', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        // 2026-05-02: KPI tokens reduzidos (era 56/40, agora 36/28)
        // após feedback de desproporcionalidade no Dashboard.
        'kpi-hero': ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'kpi': ['28px', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
