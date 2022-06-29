const mongoose = require("mongoose");
const { expenseSchema } = require("./schemas");
const { Schema } = mongoose;

const userExpenseSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  expenses: [expenseSchema],
});

module.exports = mongoose.model("Expenses", userExpenseSchema);

