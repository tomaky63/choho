/** 生成日時を閲覧端末・ビルド環境のタイムゾーンに依存せず日本時間で表示する。 */
export function formatGeneratedAtJst(iso?: string): string | null {
  // Date accepts local times and silently rolls invalid calendar days forward.
  if (!iso || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(iso)) return null;
  const date = new Date(iso);
  const calendarDay = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || Number.isNaN(calendarDay.getTime())
    || calendarDay.toISOString().slice(0, 10) !== iso.slice(0, 10)) return null;
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}/${get('month')}/${get('day')} ${get('hour')}:${get('minute')} JST`;
}
