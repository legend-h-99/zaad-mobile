// Daily records follow the Saudi calendar consistently across platforms.
export function saudiDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}
export function saudiDaysAgo(days: number, now = new Date()): string {
  return saudiDateKey(new Date(now.getTime() - days * 86400000))
}
