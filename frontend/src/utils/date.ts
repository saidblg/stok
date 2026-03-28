export const toIsoWithCurrentTime = (dateValue: string): string => {
  if (!dateValue) {
    return dateValue;
  }

  if (dateValue.includes('T')) {
    return new Date(dateValue).toISOString();
  }

  const [year, month, day] = dateValue.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date(dateValue).toISOString();
  }

  const now = new Date();
  const localDateTime = new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  );

  return localDateTime.toISOString();
};
