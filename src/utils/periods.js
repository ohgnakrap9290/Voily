function parseLocalDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfWeek(date) {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 7);
  return result;
}

export function filterRecordsByPeriod(records, period, now = new Date()) {
  if (period === "all") return records;

  return records.filter((record) => {
    const date = parseLocalDate(record.date);

    if (period === "week") {
      return date >= startOfWeek(now) && date < endOfWeek(now);
    }

    if (period === "month") {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }

    return date.getFullYear() === now.getFullYear();
  });
}
