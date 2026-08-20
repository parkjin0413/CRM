export type ValidationField = 'source' | 'name' | 'company' | 'phone'

export type ValidationError = {
  field: ValidationField
  message: string
}

const REQUIRED_FIELDS: ValidationField[] = ['source', 'name', 'company', 'phone']

const FIELD_LABELS: Record<ValidationField, string> = {
  source: '구분',
  name: '이름',
  company: '소속',
  phone: '연락처',
}

export function validateCustomerInput(
  input: { source?: string; name?: string; company?: string; phone?: string },
  validSources: string[]
): ValidationError[] {
  const errors: ValidationError[] = []

  for (const field of REQUIRED_FIELDS) {
    const value = input[field]
    if (!value || !value.trim()) {
      errors.push({ field, message: `${FIELD_LABELS[field]}은(는) 필수입니다.` })
    }
  }

  const source = input.source?.trim()
  if (source && !validSources.includes(source)) {
    errors.push({ field: 'source', message: '구분 값이 목록에 없습니다.' })
  }

  return errors
}
