const resetPayments = async (dni) => {
  const DbPayments = require("../../models/payment");

  const paymentsDoc = await DbPayments.findOne({ dni });

  paymentsDoc.payments.forEach((payment) => {
    payment.paid = false;

    //add a month to the date
    payment.paymentDate = new Date(
      payment.paymentDate.getFullYear(),
      payment.paymentDate.getMonth() + 1,
      payment.paymentDate.getDate()
    );
  });

  await paymentsDoc.save();
};

module.exports = resetPayments;
