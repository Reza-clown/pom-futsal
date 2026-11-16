const JAKARTA_TIME_ZONE = "Asia/Jakarta"

export function formatJakartaDateTime(value, options) {
  if (!value) return "-"

  return new Date(value).toLocaleString("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    ...options,
  })
}

export function toJakartaDateTimeLocal(value) {
  if (!value) return ""

  const parts = new Intl.DateTimeFormat("en", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value))
  const dateParts = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]))

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}`
}

export function jakartaDateTimeLocalToISO(value) {
  if (!value) return null

  return new Date(`${value}:00+07:00`).toISOString()
}

export function getJakartaDateKey(value) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value))
  const dateParts = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]))

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`
}
