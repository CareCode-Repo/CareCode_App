/**
 * 웹 저장소(CareCode_FE)에서 밀린 변경이 있는지 본다.
 *
 * 이 저장소는 CareCode_FE 에서 갈라져 나왔고 화면·API 코드는 여전히 대부분 같다. 그래서
 * 웹에서 고친 버그가 앱으로 **자동으로 오지 않는다.** 처음 몇 주는 기억하지만 곧 잊고,
 * 그러면 같은 버그가 앱에만 남는다.
 *
 * `.upstream-sync` 의 ref 가 "여기까지 반영했다" 는 지점이다. 그 뒤로 웹에 쌓인 커밋을
 * 찾아 목록으로 낸다. 반영한 뒤에는 ref 를 올려 함께 커밋한다.
 *
 *   node scripts/check-upstream.mjs            사람이 읽을 형태로 출력
 *   node scripts/check-upstream.mjs --github   워크플로가 쓸 출력까지 함께
 *
 * 밀린 것이 있으면 종료 코드 1. CI 를 깨뜨리는 용도가 아니라 워크플로가 분기하는 용도다.
 */
import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

/** `.upstream-sync` 는 주석과 key=value 뿐이다. 형식을 늘리지 않는다. */
const readSyncPoint = () => {
  const entries = readFileSync(new URL('../.upstream-sync', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => line.split('='))

  return Object.fromEntries(entries.map(([key, ...rest]) => [key.trim(), rest.join('=').trim()]))
}

const { repo, branch, ref } = readSyncPoint()
if (!repo || !branch || !ref) {
  console.error('.upstream-sync 에 repo·branch·ref 가 모두 있어야 한다')
  process.exit(2)
}

/**
 * 웹 저장소를 받아 온다.
 *
 * 리모트를 등록해 두지 않았어도 돌아야 한다 — CI 는 매번 새로 체크아웃하고, 사람도 이 저장소를
 * 막 받은 참일 수 있다. 그래서 리모트 이름 대신 주소를 그대로 준다.
 */
git(
  'fetch',
  '--no-tags',
  `https://github.com/${repo}.git`,
  `+refs/heads/${branch}:refs/remotes/upstream/${branch}`,
)

const head = git('rev-parse', `refs/remotes/upstream/${branch}`)

if (head === ref) {
  console.log(`밀린 변경 없음 — ${repo}@${branch} 가 ${ref.slice(0, 7)} 그대로다.`)
  process.exit(0)
}

const commits = git('log', '--no-merges', '--format=- `%h` %s', `${ref}..${head}`)
const files = git('diff', '--stat', `${ref}..${head}`)

// 머지만 쌓였다면 실제로 옮길 내용이 없다.
if (!commits) {
  console.log(
    `머지 커밋만 쌓였다 — 옮길 내용 없음. .upstream-sync 의 ref 를 ${head.slice(0, 7)} 로 올려도 된다.`,
  )
  process.exit(0)
}

const body = [
  `[${repo}](https://github.com/${repo}) 의 \`${branch}\` 에 이 저장소로 아직 옮기지 않은 변경이 있습니다.`,
  '',
  `- 마지막으로 반영한 지점: \`${ref.slice(0, 7)}\``,
  `- 웹 저장소 현재: \`${head.slice(0, 7)}\``,
  `- [두 지점 비교](https://github.com/${repo}/compare/${ref}...${head})`,
  '',
  '### 아직 반영하지 않은 커밋',
  '',
  commits,
  '',
  '### 바뀐 파일',
  '',
  '```',
  files,
  '```',
  '',
  '---',
  '',
  '전부 옮겨야 하는 것은 아닙니다. 이 저장소에만 있는 것(네이티브 셸·정적 export·`*.web.tsx`)과',
  '겹치는 변경은 손으로 판단해야 합니다. 옮긴 뒤에는 `.upstream-sync` 의 `ref` 를',
  `\`${head}\` 로 올려 함께 커밋하세요.`,
].join('\n')

console.log(body)

if (process.argv.includes('--github') && process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `drift=true\n`)
  appendFileSync(process.env.GITHUB_OUTPUT, `head=${head}\n`)
  appendFileSync(process.env.GITHUB_OUTPUT, `body<<EOF_BODY\n${body}\nEOF_BODY\n`)
}

process.exit(1)
