const mongoose = require("mongoose");
const { otherDebtSchema, userDebtSchema } = require("./schemas");
const { Schema } = mongoose;

const userDebtsSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  totalUserDebt: Number,
  totalOtherDebt: Number,
  userDebts: [userDebtSchema],
  otherDebts: [otherDebtSchema],
});

module.exports = mongoose.model("Debts", userDebtsSchema);
