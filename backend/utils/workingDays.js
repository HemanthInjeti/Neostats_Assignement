const addWorkingDays = (startDate, days) => {
  const date = new Date(startDate);
  let remaining = days;

  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return date;
};

module.exports = { addWorkingDays };
