import type { FieldValues, Resolver } from 'react-hook-form'
import type { ZodType } from 'zod'

/**
 * zod 스키마를 react-hook-form 의 resolver 로 쓴다.
 *
 * 폼 규칙을 `rules={{ ... }}` 로 따로 적으면 API 스키마와 두 벌이 되고, 서버 계약이 바뀌어도
 * 폼은 모른 채 통과시킨다. 검증의 출처를 스키마 하나로 모은다.
 *
 * `@hookform/resolvers` 를 쓰지 않는 이유는 이 어댑터가 하는 일이 이게 전부이기 때문이다.
 * (resolver 계약: 값이 유효하면 `{ values, errors: {} }`, 아니면 `{ values: {}, errors }`)
 */
export const zodResolver =
  <TFieldValues extends FieldValues>(schema: ZodType<unknown>): Resolver<TFieldValues> =>
  async (values) => {
    const result = schema.safeParse(values)

    if (result.success) {
      return { values: values as TFieldValues, errors: {} }
    }

    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      // 같은 필드에 여러 이슈가 있으면 첫 번째만 보여준다. 한 번에 하나씩 고치게 한다.
      const path = issue.path.join('.')
      if (path && !errors[path]) {
        errors[path] = { type: issue.code, message: issue.message }
      }
    }

    return { values: {}, errors: errors as never }
  }
