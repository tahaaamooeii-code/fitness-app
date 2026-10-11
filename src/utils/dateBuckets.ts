import { format, eachDayOfInterval, parseISO } from "date-fns";

export function todayBucket(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function dateToBucket(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function bucketsInRange(startDate: string, endDate: string): string[] {
  return eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  }).map((d) => format(d, "yyyy-MM-dd"));
}

export function daysAgoBucket(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateToBucket(d);
}
