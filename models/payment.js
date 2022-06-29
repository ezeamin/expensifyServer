const mongoose = require("mongoose");
const { paymentSchema } = require("./schemas");
const { Schema } = mongoose;

const userPaymentSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  payments: [paymentSchema],
});

module.exports = mongoose.model("Payments", userPaymentSchema);

