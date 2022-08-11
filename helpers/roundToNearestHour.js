const roundToNearestHour = (date) => {
  date.setMinutes(date.getMinutes() + 30);
  date.setMinutes(0, 0, 0);

  return date;
};

module.exports = roundToNearestHour;
