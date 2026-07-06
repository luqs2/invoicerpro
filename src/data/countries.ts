import countriesData from './countries.json'

export interface Country {
  name: string
  code: string
  dialCode: string
}

export const countries: Country[] = countriesData

export function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('')
}

export const COUNTRY_OPTIONS = countries.map(c => ({
  value: c.code,
  label: `${countryCodeToFlag(c.code)} ${c.name}`,
  description: `+${c.dialCode}`,
}))

export const DEFAULT_COUNTRY_CODE = 'MY'

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code)
}

export function parsePhoneWithCountryCode(phone: string): { countryCode: string; localNumber: string } {
  if (!phone) return { countryCode: DEFAULT_COUNTRY_CODE, localNumber: '' }

  const trimmed = phone.trim()

  // If user typed a leading +, try to match a known dial code
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1)
    // Sort by dial code length descending so "+880" matches before "+88" etc.
    const sorted = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length)
    for (const c of sorted) {
      if (digits.startsWith(c.dialCode)) {
        return { countryCode: c.code, localNumber: digits.slice(c.dialCode.length) }
      }
    }
    // No match — return full digits with default country
    return { countryCode: DEFAULT_COUNTRY_CODE, localNumber: digits }
  }

  // No leading + — assume local number with default country
  return { countryCode: DEFAULT_COUNTRY_CODE, localNumber: trimmed }
}

export function combinePhone(countryCode: string, localNumber: string): string {
  const country = getCountryByCode(countryCode)
  if (!country) return localNumber
  const digits = localNumber.replace(/[^\d]/g, '')
  if (!digits) return ''
  return `+${country.dialCode}${digits}`
}
