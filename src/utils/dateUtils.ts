/**
 * Date and time helper utilities with Slovak localization.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffsetString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const SLOVAK_DAY_NAMES = [
  'Nedeľa',
  'Pondelok',
  'Utorok',
  'Streda',
  'Štvrtok',
  'Piatok',
  'Sobota',
];

const SLOVAK_MONTH_NAMES_GENITIVE = [
  'januára',
  'februára',
  'marca',
  'apríla',
  'mája',
  'júna',
  'júla',
  'augusta',
  'septembra',
  'októbra',
  'novembra',
  'decembra',
];

const SLOVAK_MONTH_NAMES_SHORT = [
  'jan',
  'feb',
  'mar',
  'apr',
  'máj',
  'jún',
  'júl',
  'aug',
  'sep',
  'okt',
  'nov',
  'dec',
];

export function formatSlovakDateFriendly(dateStr: string): string {
  const today = getTodayDateString();
  const tomorrow = getDateOffsetString(1);
  const dayAfterTomorrow = getDateOffsetString(2);

  if (dateStr === today) {
    return 'Dnes';
  }
  if (dateStr === tomorrow) {
    return 'Zajtra';
  }
  if (dateStr === dayAfterTomorrow) {
    return 'Pozajtra';
  }

  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const dayName = SLOVAK_DAY_NAMES[d.getDay()];
  const monthShort = SLOVAK_MONTH_NAMES_SHORT[d.getMonth()];
  return `${dayName}, ${d.getDate()}. ${monthShort}`;
}

export function formatSlovakDateFull(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const dayName = SLOVAK_DAY_NAMES[d.getDay()];
  const monthGenitive = SLOVAK_MONTH_NAMES_GENITIVE[d.getMonth()];
  return `${dayName}, ${d.getDate()}. ${monthGenitive} ${d.getFullYear()}`;
}

export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} h ${mins} min`;
  }
  if (hours > 0) {
    return `${hours} h`;
  }
  return `${mins} min`;
}

export function getQuickDayPresets(): Array<{ label: string; date: string; sublabel: string }> {
  const today = getTodayDateString();
  const tomorrow = getDateOffsetString(1);
  const dayAfter = getDateOffsetString(2);

  const getDayName = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return SLOVAK_DAY_NAMES[d.getDay()];
  };

  return [
    { label: 'Dnes večer', date: today, sublabel: 'dnes' },
    { label: 'Zajtra', date: tomorrow, sublabel: getDayName(1) },
    { label: 'Pozajtra', date: dayAfter, sublabel: getDayName(2) },
    { label: getDayName(3), date: getDateOffsetString(3), sublabel: '+3 dni' },
    { label: getDayName(4), date: getDateOffsetString(4), sublabel: '+4 dni' },
  ];
}
