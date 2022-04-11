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

const editList = async (type, dni, id, newData, res) => {
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

      let infoPosition = info[listName].findIndex((info) => info.id === id);

      info[listName][infoPosition].set(newData);

      if (type === "account") {
        if (newData.balance === 0) {
          info[listName][infoPosition].noBalance = true;
        } else {
          info[listName][infoPosition].noBalance = false;
        }
      } else if (type === "category") {
        if (newData.limit === 0) {
          info[listName][infoPosition].noLimit = true;
        } else {
          info[listName][infoPosition].noLimit = false;
        }
      }

      await info.save((err) => {
        if (err) {
          res.status(401).json(err);
        }

        res.status(200).json(info);
      });
    }
  );
};

module.exports = editList;
