const DbAccounts = require("../../models/account");

const updateAccountValues = (dni, oldData, type) => {
  DbAccounts.findOne(
    {
      dni,
    },
    async (err, info) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!info) {
        console.log("No existe la cuenta");
        return;
      }

      const accountIndex = info.accounts.findIndex(
        (account) => account.id === oldData.accountId
      );

      const account = info.accounts[accountIndex];

      if (type === "expense") {
        if(!account.noBalance) account.balance += oldData.price;
        account.spent -= oldData.price;
      } else if (type === "income") {
        if(!account.noBalance) account.balance -= oldData.price;

        info.totalIncome -= oldData.price;
      }

      await info.save((err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  );
};

module.exports = updateAccountValues;
