const mongoose = require("mongoose");
const { Schema } = mongoose;

const userDebtSchema = new Schema({
  id: String,
  lenderName: String,
  debts: [{
    id: String,
    destinationAccountId: String, // not mandatory
    date: Date,
    price: Number,
    description: String,
    modified: Boolean,
  }],
});

const otherDebtSchema = new Schema({
    id: String,
    debtorName: String,
    debts: [{
        id: String,
        originAccountId: String, // not mandatory
        date: Date,
        price: Number,
        description: String,
    }],
});

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
