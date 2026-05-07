/**
 * KEYRA · Remotion Root
 *
 * Registra todas as compositions Remotion. Use `pnpm remotion:studio` para
 * preview interativo, ou `pnpm remotion:render <id>` para gerar MP4.
 *
 * Story brand.8 do Epic BRAND-INTEGRATION.
 */

import { Composition } from 'remotion';

import { BrandIntro } from './compositions/BrandIntro';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Brand Intro · 16:9 horizontal (apresentações, propostas comerciais) */}
      <Composition
        id="brand-intro-16-9"
        component={BrandIntro}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          format: '16:9' as const,
          taglineOverride: 'sua clínica rendendo mais.',
          showTagline: true,
          showGoldDetail: true,
          duration: 120,
        }}
      />

      {/* Brand Intro · 9:16 vertical (Reels, Stories, TikTok) */}
      <Composition
        id="brand-intro-9-16"
        component={BrandIntro}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          format: '9:16' as const,
          taglineOverride: 'sua clínica rendendo mais.',
          showTagline: true,
          showGoldDetail: true,
          duration: 120,
        }}
      />
    </>
  );
};
