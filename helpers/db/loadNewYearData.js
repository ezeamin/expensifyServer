const DbOlds = require('../../models/period');

const loadNewYearData = () => {
  DbOlds.find({}, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      docs.forEach((doc) => {
        console.log(doc);
        doc.periods.push({
          year: new Date().getFullYear(), // RUN ONLY ONCE
          periods: [],
        });
        doc.save();
      });
    }
  });
};

module.exports = loadNewYearData;
