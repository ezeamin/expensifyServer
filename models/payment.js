const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema({
  id: String,
  title: String,
  categoryId: String,
  accountId: String,
  date: Date,
  paymentDate: Date,
  price: Number,
  description: String,
  modified: Boolean,
});

const userPaymentSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  payments: [paymentSchema],
});

module.exports = mongoose.model("Payments", userPaymentSchema);
