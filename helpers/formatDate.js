const formatDate = (newDate) => {
  const date = new Date(newDate + " UTC");

  let days = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  if (days < 10) {
    days = "0" + days;
  }
  if (month < 10) {
    month = "0" + month;
  }

  const day = `${days}/${month}/${year}`;

  let time = date.toISOString().substring(11, 19);

  return { day, time };
};

module.exports = formatDate;
