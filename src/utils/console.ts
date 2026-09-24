const COLORS = {
  GET: '\x1b[34m', // 파랑
  POST: '\x1b[32m', // 초록
  PUT: '\x1b[33m', // 노랑
  DELETE: '\x1b[31m', // 빨강
  RESET: '\x1b[0m', // 기본색

  STATUS_SUCCESS: '\x1b[32m', // 200~299 초록
  STATUS_REDIRECT: '\x1b[36m', // 300~399 하늘색
  STATUS_CLIENT_ERROR: '\x1b[33m', // 400~499 노랑
  STATUS_SERVER_ERROR: '\x1b[31m', // 500+ 빨강
}

type HttpMethod = keyof typeof COLORS // "GET" | "POST" | "PUT" | "DELETE" | "RESET" | ...

/**
 * 토큰은 붙었는지 여부만 알면 된다.
 * 전문을 찍으면 화면 공유·녹화·스크린샷에 그대로 남는다.
 */
const maskToken = (authorization: unknown): string => {
  if (typeof authorization !== 'string' || !authorization) return '(none)'
  return `${authorization.slice(0, 13)}…(${authorization.length})`
}

/**
 * HTTP 요청 정보를 콘솔에 출력하는 함수
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const printRequestConsole = (config: { [key: string]: any }): void => {
  const method = config.method?.toUpperCase() as HttpMethod | undefined
  const methodColor = method ? (COLORS[method] ?? COLORS.RESET) : COLORS.RESET

  console.log(`
    ${methodColor}====== [HTTP REQUEST] ======${COLORS.RESET}
    - Method : ${methodColor}${method ?? 'UNKNOWN'}${COLORS.RESET}
    - URL    : ${config.baseURL}${config.url}
    - Data   : ${JSON.stringify(config.data, null, 2)}
    - Params : ${JSON.stringify(config.params, null, 2)}
    - Auth   : ${maskToken(config.headers?.Authorization)}
    =================================
  `)
}

/**
 * HTTP 응답 정보를 콘솔에 출력하는 함수
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const printResponseConsole = (res: { [key: string]: any }): void => {
  const status = res.status
  let statusColor = COLORS.RESET

  if (status >= 200 && status < 300) statusColor = COLORS.STATUS_SUCCESS
  else if (status >= 300 && status < 400) statusColor = COLORS.STATUS_REDIRECT
  else if (status >= 400 && status < 500) statusColor = COLORS.STATUS_CLIENT_ERROR
  else if (status >= 500) statusColor = COLORS.STATUS_SERVER_ERROR

  const responseData = Array.isArray(res.data) ? res.data : res.data ? [res.data] : []
  const firstItem = responseData.length > 0 ? JSON.stringify(responseData[0], null, 2) : '없음'
  const additionalCount = responseData.length > 1 ? `이외 ${responseData.length - 1}건` : ''

  console.log(`
    ${statusColor}====== [HTTP RESPONSE] ======${COLORS.RESET}
    - Status : ${statusColor}${status}${COLORS.RESET}
    - Method : ${res.config.method?.toUpperCase() ?? 'UNKNOWN'}
    - URL    : ${res.config.baseURL}${res.config.url}
    - Data   : ${firstItem} ${additionalCount}
    =================================
  `)
}

/**
 * HTTP 요청 또는 응답에서 발생한 오류를 콘솔에 출력하는 함수
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const printErrorConsole = (error: { [key: string]: any }): void => {
  if (error?.response) {
    const status = error.response.status
    let statusColor = COLORS.RESET

    if (status >= 400 && status < 500) statusColor = COLORS.STATUS_CLIENT_ERROR
    else if (status >= 500) statusColor = COLORS.STATUS_SERVER_ERROR

    const errorConfig = error.response.config

    console.log(`
      ${statusColor}====== [HTTP ERROR] ======${COLORS.RESET}
      - Status : ${statusColor}${status}${COLORS.RESET}
      - Method : ${errorConfig?.method?.toUpperCase() ?? 'UNKNOWN'}
      - URL    : ${errorConfig?.baseURL ?? ''}${errorConfig?.url ?? ''}
      - Data   : ${JSON.stringify(error.response.data, null, 2)}
      =================================
    `)
  } else {
    console.log(`
      ${COLORS.STATUS_SERVER_ERROR}====== [HTTP ERROR] ======${COLORS.RESET}
      - Error: ${JSON.stringify(error, null, 2)}
      =================================
    `)
  }
}
