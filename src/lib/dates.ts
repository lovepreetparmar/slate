import {
  format,
  startOfDay,
  subDays,
  isSameDay,
  parseISO,
} from "date-fns";

export function getToday(): Date {
  return startOfDay(new Date());
}

export function getYesterday(): Date {
  return startOfDay(subDays(new Date(), 1));
}

export function formatDisplayDate(date: Date = new Date()): string {
  return format(date, "EEEE, MMMM d");
}

export function toDateString(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function parseDateString(dateStr: string): Date {
  return startOfDay(parseISO(dateStr));
}

export function isToday(dateStr: string): boolean {
  return toDateString(new Date()) === dateStr;
}

export function isYesterday(dateStr: string): boolean {
  return isSameDay(parseISO(dateStr), subDays(new Date(), 1));
}

export function getYesterdayString(): string {
  return toDateString(subDays(new Date(), 1));
}

export function parseTaskDate(dateStr: string): Date {
  const parsed = parseISO(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return startOfDay(parsed);
}
