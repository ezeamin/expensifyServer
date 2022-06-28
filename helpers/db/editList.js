const roundToTwo = require("../roundToTwo");

const switchFunction = (type) => {
  switch (type) {
    case "account":
      return { db: require("../../models/account"), listName: "accounts" };
    case "category":
      return { db: require("../../models/category"), listName: "categories" };
    case "expense":
      return { db: require("../../models/expense"), listName: "expenses" };
    case "income":
      return { db: require("../../models/income"), listName: "incomes" };
    case "transfer":
      return { db: require("../../models/transfer"), listName: "transfers" };
    case "payment":
      return { db: require("../../models/payment"), listName: "payments" };
    default:
      return null;
  }
};

const editList = async (type, dni, id, data, res) => {
  const { db, listName } = switchFunction(type);

  db.findOne(
    {
      dni,
    },
    async (err, info) => {
      if (err) {
        res.status(401).json(err);
      }

      if (!info) {
        res.sendStatus(404);
        return;
      }

      console.log(data);
      if (
        Object.keys(data.new).includes("price") ||
        Object.keys(data.new).includes("balance")
      ) {
        if (data.new.price) {
          data.new.price = roundToTwo(data.new.price);
        } else {
          data.new.balance = roundToTwo(data.new?.balance);
        }
      }

      let infoPosition = info[listName].findIndex((info) => info.id === id);

      info[listName][infoPosition].set(data.new);

      if (type === "expense") {
        updateCategoryValues(dni, data);
        updateAccountValues(dni, data, "expense");
      }

      if (type === "income") {
        updateAccountValues(dni, data, "income");
      }

      if (type === "account") {
        if (data.balance === 0) {
          info[listName][infoPosition].noBalance = true;
        } else {
          info[listName][infoPosition].noBalance = false;
        }
      } else if (type === "category") {
        if (data.limit === 0) {
          info[listName][infoPosition].noLimit = true;
        } else {
          info[listName][infoPosition].noLimit = false;
        }
      }

      await info.save((err) => {
        if (err) {
          res.status(401).json(err);
        }
      });

      //TODO: si se modifica expense, debe modificarse el balance de la cuenta y de la categoria!!!!!!!!!!!!!!

      res.status(200).json(info);
    }
  );
};

const updateCategoryValues = (dni, data) => {
  if (
    data.old.price === data.new.price &&
    data.old.categoryId === data.new.categoryId
  )
    return;

  const { db } = switchFunction("category");

  db.findOne(
    {
      dni,
    },
    async (err, info) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!info) {
        console.log("No existe la categoria");
        return;
      }

      const oldCategoryIndex = info.categories.findIndex(
        (category) => category.id === data.old.categoryId
      );

      const newCategoryIndex = info.categories.findIndex(
        (category) => category.id === data.new.categoryId
      );

      const oldCategory = info.categories[oldCategoryIndex];
      const newCategory = info.categories[newCategoryIndex];

      oldCategory.spent -= data.old.price;
      newCategory.spent += data.new.price;

      await info.save((err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  );
};

const updateAccountValues = (dni, data, type) => {
  if (
    data.old.price === data.new.price &&
    data.old.accountId === data.new.accountId
  )
    return;

  const { db } = switchFunction("account");

  db.findOne(
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

      const oldAccountIndex = info.accounts.findIndex(
        (account) => account.id === data.old.accountId
      );

      const newAccountIndex = info.accounts.findIndex(
        (account) => account.id === data.new.accountId
      );

      const oldAccount = info.accounts[oldAccountIndex];
      const newAccount = info.accounts[newAccountIndex];

      if (type === "expense") {
        oldAccount.balance += data.old.price;
        newAccount.balance -= data.new.price;

        oldAccount.spent -= data.old.price;
        newAccount.spent += data.new.price;
      } else if (type === "income") {
        oldAccount.balance -= data.old.price;
        newAccount.balance += data.new.price;
      }

      await info.save((err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  );
};

module.exports = editList;
