const addNewMonth = (date) => {
  let dateSplit = date.split("-");
  const dateToCheck = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2]);
  const newDate = new Date(dateToCheck.setMonth(dateToCheck.getMonth() + 1));

  let day = newDate.getDate();
  let month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();

  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }

  return `${year}-${month}-${day}`;
};

module.exports = addNewMonth;
