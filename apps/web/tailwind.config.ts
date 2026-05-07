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
        // KEYRA Brand Identity (Epic BRAND-INTEGRATION):
        // Fraunces serif para editorial, Inter sans para funcional.
        // Source of truth: docs/brand/03-identity/typography-system.md
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Times New Roman', 'serif'],
      },
      colors: {
        // Tokens semânticos compatíveis com shadcn/ui (HSL via CSS vars)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Primary scale = terracota canônica (KEYRA brand)
        // 500 = terracotta-600 = CTA padrão (matches CSS var --primary)
        // 600 = terracotta-700 = hover state
        // 700 = rust-800 = active/destructive intense
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#FAF6EE',   // ivory-50
          100: '#F4EDE2',  // ivory-100
          200: '#E5B473',  // amber-300 (soft warm)
          300: '#D89A4D',  // amber-400
          400: '#C8843A',  // amber-500
          500: '#B8612B',  // terracotta-600 (canonical CTA)
          600: '#A05525',  // terracotta-700 (hover)
          700: '#843E1A',  // rust-800 (active/intense)
          800: '#5A3E26',  // cocoa-700
          900: '#3F2A1B',  // cocoa-800
        },
        // Secondary scale = bronze canônico (KEYRA brand)
        // 400 = bronze-500 = neutro warm (matches CSS var --secondary)
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#F4EDE2',   // ivory-100
          100: '#EAE0CF',  // sand-200
          200: '#C8B49A',  // mocha-300
          300: '#946640',  // bronze-400
          400: '#7E5A40',  // bronze-500 (canonical)
          500: '#5A3E26',  // cocoa-700
          600: '#3F2A1B',  // cocoa-800
          700: '#2B1810',  // cocoa-900
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

        // ──────────────────────────────────────────────────────────
        // KEYRA Brand Palette — canônica (Epic BRAND-INTEGRATION).
        // Source of truth: docs/brand/03-identity/colors-manual.md
        // Use estas cores para migrar usos legados de slate-*, blue-*, etc.
        // ──────────────────────────────────────────────────────────
        ivory: { 50: '#FAF6EE', 100: '#F4EDE2' },
        sand: { 200: '#EAE0CF' },
        mocha: { 300: '#C8B49A' },
        bronze: { 400: '#946640', 500: '#7E5A40' },
        cocoa: { 700: '#5A3E26', 800: '#3F2A1B', 900: '#2B1810' },
        ink: { 950: '#181210' },
        amber: { 300: '#E5B473', 400: '#D89A4D', 500: '#C8843A' },
        terracotta: { 500: '#C26832', 600: '#B8612B', 700: '#A05525' },
        rust: { 800: '#843E1A' },
        champagne: { 200: '#F0D8A8' },
        gold: { 300: '#E5C690', 400: '#D4A752', 500: '#B8923A', 600: '#9A7A2C' },
        'success-leaf': '#6E8C5A',
        'success-deep': '#4F6840',

        // Semantic financial states (atualizados para palette KEYRA)
        lucro: '#6E8C5A',         // success-leaf (era #457A50 sálvia)
        prejuizo: '#843E1A',      // rust-800 (era #B23A3A vermelho terra)
        neutro: '#7E5A40',        // bronze-500 (era #6B6560 cinza)
        alerta: '#C8843A',        // amber-500 (era #D4A341)
        info: '#5A6C7E',          // info quente (era #8A7A6B)
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
      // ────────────────────────────────────────────────────────────
      // KEYRA Motion System — durations, easings, distances canônicas
      // Source: docs/brand/03-identity/motion-system/motion-tokens.md
      // ────────────────────────────────────────────────────────────
      transitionDuration: {
        instant: '100ms',
        fast: '200ms',
        base: '320ms',
        slow: '480ms',
        cinematic: '720ms',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out-editorial': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'in-quiet': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'out-bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      // Warm shadows (cocoa-based, não slate)
      boxShadow: {
        'warm-xs': '0 1px 2px 0 rgba(43, 24, 16, 0.04)',
        'warm-sm': '0 2px 4px 0 rgba(43, 24, 16, 0.06)',
        'warm-md': '0 4px 8px 0 rgba(43, 24, 16, 0.08)',
        'warm-lg': '0 8px 16px 0 rgba(43, 24, 16, 0.12)',
        'warm-xl': '0 16px 32px 0 rgba(43, 24, 16, 0.16)',
        'premium-glow': '0 0 24px 0 rgba(184, 146, 58, 0.18)',
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
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-scale': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-scale': 'fade-scale 320ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
