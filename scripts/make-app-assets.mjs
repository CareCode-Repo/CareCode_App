/**
 * 스토어용 아이콘·스플래시 원본을 만든다.
 *
 * 만들어 두면 끝인 파일들이지만, 손으로 그려 두면 로고가 바뀌었을 때 무엇을 어떻게 다시
 * 뽑아야 하는지 아무도 모른다. 그래서 앱이 이미 쓰고 있는 자산에서 항상 다시 만들 수 있게 둔다.
 *
 *   `public/images/app-icon.svg`      → 아이콘 (원본은 512 기준 벡터)
 *   `src/assets/icons/logo/logo.svg`  → 스플래시 가운데 워드마크
 *
 * 결과는 `assets/` 에 떨어지고, `npx @capacitor/assets generate` 가 이걸 받아 안드로이드
 * mipmap 과 iOS AppIcon 세트로 펼친다. 이 스크립트는 "원본" 까지만 책임진다.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ICON_SIZE = 1024 // 두 스토어가 요구하는 최대 크기
const SPLASH_SIZE = 2732 // @capacitor/assets 가 기대하는 정사각 원본

/** 로그인 화면 배경(green-200). 스플래시를 같은 색으로 둬야 첫 화면으로 넘어갈 때 튀지 않는다. */
const SPLASH_BG = '#b5e89e'
/** 다크 모드 스플래시. 밝은 연두를 그대로 쓰면 어두운 화면에서 눈이 부신다. */
const SPLASH_BG_DARK = '#0f2e08'
/** 아이콘 배경(green-600). 매니페스트의 theme_color 와 같다. */
const ICON_BG = '#4fbe27'

const root = new URL('..', import.meta.url)
const at = (p) => new URL(p, root)

const render = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer()

/** 아이콘 SVG 에서 배경 사각형을 뺀 글리프만 꺼낸다(적응형 아이콘 전경용). */
const glyphOnly = (iconSvg) => {
  const body = iconSvg.replace(/<rect[^>]*\/>/, '')
  const inner = body.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

  /**
   * 안드로이드 적응형 아이콘은 바깥을 잘라낸다 — 108dp 중 가운데 72dp 만 늘 보인다.
   * 원본 글리프는 512 캔버스의 약 67% 를 차지해서 그대로 두면 둥근 마스크에서 가장자리가
   * 깎인다. 안전 영역에 들어오도록 줄이고 가운데로 다시 민다.
   */
  const scale = 0.78
  const offset = (512 * (1 - scale)) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g transform="translate(${offset} ${offset}) scale(${scale})">${inner}</g>
</svg>`
}

/** logo.svg 는 벡터가 아니라 base64 PNG 를 품고 있다. 그 비트맵을 꺼내 쓴다. */
const extractLogoBitmap = (logoSvg) => {
  const match = logoSvg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)
  if (!match) throw new Error('logo.svg 안에서 PNG 를 찾지 못했다 — 자산이 바뀌었는지 확인할 것')
  return Buffer.from(match[1], 'base64')
}

const makeSplash = async (logo, background, out) => {
  // 스플래시 원본은 정사각이지만 기기 화면은 세로로 길어, 표시될 때 좌우가 잘린다.
  // 그래서 정사각 기준 40% 면 실제 화면에서는 폭의 절반 남짓으로 보인다(로그인 화면과 비슷).
  const logoWidth = Math.round(SPLASH_SIZE * 0.4)
  const resized = await sharp(logo).resize({ width: logoWidth }).png().toBuffer()

  await sharp({
    create: {
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      channels: 4,
      background,
    },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    // sharp 의 toFile 은 URL 을 받지 않는다.
    .toFile(fileURLToPath(out))
}

const main = async () => {
  await mkdir(at('assets/'), { recursive: true })

  const iconSvg = await readFile(at('public/images/app-icon.svg'), 'utf8')
  const logoSvg = await readFile(at('src/assets/icons/logo/logo.svg'), 'utf8')

  // 아이콘 원본 (배경 포함)
  await writeFile(at('assets/icon-only.png'), await render(iconSvg, ICON_SIZE))
  // @capacitor/assets 는 `logo` 를 아이콘·스플래시 양쪽의 기본값으로도 쓴다.
  await writeFile(at('assets/logo.png'), await render(iconSvg, ICON_SIZE))

  // 안드로이드 적응형 아이콘: 배경과 전경이 따로 움직인다(기기마다 마스크가 다르다).
  await writeFile(
    at('assets/icon-background.png'),
    await sharp({
      create: { width: ICON_SIZE, height: ICON_SIZE, channels: 4, background: ICON_BG },
    })
      .png()
      .toBuffer(),
  )
  await writeFile(at('assets/icon-foreground.png'), await render(glyphOnly(iconSvg), ICON_SIZE))

  // 스플래시
  const logo = extractLogoBitmap(logoSvg)
  await makeSplash(logo, SPLASH_BG, at('assets/splash.png'))
  await makeSplash(logo, SPLASH_BG_DARK, at('assets/splash-dark.png'))

  console.log('assets/ 에 아이콘·스플래시 원본을 만들었다. 다음: npx @capacitor/assets generate')
}

await main()
