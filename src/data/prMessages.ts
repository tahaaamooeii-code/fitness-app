const TEMPLATES: string[] = [
  "رکورد جدید زدی! 💪 {exercise}: {weight} کیلوگرم",
  "قوی‌تر از دیروز! {exercise} رو با {weight} کیلوگرم زدی",
  "آفرین قهرمان! رکورد {exercise} شکسته شد: {weight} کیلوگرم",
  "داری پیشرفت می‌کنی! {exercise} حالا {weight} کیلوگرمه",
  "عالی بود! یه پله دیگه بالاتر رفتی توی {exercise}",
];

export function pickPrMessage(exerciseName: string, weightKg: number): string {
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  return template
    .replace("{exercise}", exerciseName)
    .replace("{weight}", String(weightKg));
}
