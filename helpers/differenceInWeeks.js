const differenceInWeeks = (d1, d2) => {
  let t2 = d2.getTime();
  let t1 = d1.getTime();

  return Math.abs(parseInt((t2 - t1) / (24 * 3600 * 1000 * 7)));
};

module.exports = differenceInWeeks;
