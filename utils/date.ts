import { format, parseISO } from 'date-fns';

export function formatShortDate(date: string) {
  return format(parseISO(date), 'MMM d');
}

export function formatMonthLabel(date: Date = new Date()) {
  return format(date, 'MMMM yyyy');
}

export function getMonthKey(date: string) {
  return date.slice(0, 7);
}
