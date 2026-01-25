export const commonBlockedDates = (count: number = 8): string[] => {
  const dates: string[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const validDays: number[] = [];

  // Trova giorni validi (escludi passati e weekend)
  for (let day = currentDay; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      validDays.push(day);
    }
  }

  // Seleziona random
  const shuffled = validDays.sort(() => Math.random() - 0.5);
  const selectedDays = shuffled.slice(0, Math.min(count, validDays.length));

  selectedDays.forEach((day) => {
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    dates.push(`${currentYear}/${month}/${dayStr}`);
  });

  return dates.sort();
};
