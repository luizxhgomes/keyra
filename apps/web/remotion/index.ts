/**
 * KEYRA · Remotion entry point.
 *
 * Registra o RemotionRoot que contém todas as compositions canônicas.
 *
 * Para usar:
 *   1. Instalar deps Remotion (ver README.md desta pasta)
 *   2. `pnpm remotion:studio` para preview interativo
 *   3. `pnpm remotion:render brand-intro-16-9` para gerar MP4
 *
 * Story brand.8 do Epic BRAND-INTEGRATION.
 */

import { registerRoot } from 'remotion';

import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
