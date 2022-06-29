const mongoose = require("mongoose");
const { incomeSchema } = require("./schemas");
const { Schema } = mongoose;

const userIncomeSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  totalIncome: Number,
  incomes: [incomeSchema],
});

module.exports = mongoose.model("Incomes", userIncomeSchema);

