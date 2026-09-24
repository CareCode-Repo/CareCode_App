/**
 * 앱(Capacitor) 빌드.
 *
 * 웹 전용 라우트는 대부분 확장자(`*.web.tsx`)로 걸러낸다(next.config.ts). 그런데 메타데이터
 * 파일은 **파일 이름 자체가 규약**이라 그 방법이 통하지 않는다 — 이름을 바꾸면 라우트는
 * 생기지만 GET 핸들러로 이어지지 않아 405 가 된다.
 *
 * 그중 `policy/[id]/opengraph-image.tsx` 하나가 정적 export 와 정면으로 부딪힌다. 동적
 * 세그먼트의 OG 이미지는 `generateStaticParams` 를 페이지에 둬도, 이미지 파일에 둬도 Next 가
 * 읽지 못해 "missing generateStaticParams" 로 빌드가 멈춘다.
 *
 * 카카오톡 등에서 지원금 링크를 펼쳤을 때 제목이 보이는 카드라 웹에서는 버릴 수 없다.
 * 그래서 **앱 빌드 동안만** 비켜 두었다가 끝나면 되돌린다. 빌드가 실패하거나 중단돼도
 * finally 에서 원복하므로 작업 트리에 흔적이 남지 않는다.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** 앱 빌드에서 잠시 치워 둘 파일. 늘어나면 여기에 추가한다. */
const WEB_ONLY = ['src/app/(without-tabs)/policy/[id]/opengraph-image.tsx']

const STASH = '.app-build-stash'

const stash = () => {
  for (const file of WEB_ONLY) {
    if (!existsSync(file)) continue
    const to = join(STASH, file)
    mkdirSync(dirname(to), { recursive: true })
    renameSync(file, to)
  }
}

const restore = () => {
  for (const file of WEB_ONLY) {
    const from = join(STASH, file)
    if (!existsSync(from)) continue
    mkdirSync(dirname(file), { recursive: true })
    renameSync(from, file)
  }
  rmSync(STASH, { recursive: true, force: true })
}

// 앞선 빌드가 비정상 종료해 남은 파일이 있으면 먼저 제자리로 돌린다.
restore()

let code = 1
try {
  stash()
  code = spawnSync('next', ['build'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, BUILD_TARGET: 'app' },
  }).status
} finally {
  restore()
}

process.exit(code ?? 1)
