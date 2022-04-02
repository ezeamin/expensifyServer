const switchFunction = (type) => {
  switch (type) {
    case "account":
      return { db: require("../../models/account"), listName: "accounts" };
    case "category":
      return { db: require("../../models/category"), listName: "categories" };
    case "expense":
      return { db: require("../../models/expense"), listName: "expenses" };
    default:
      return null;
  }
};

const resetSpent = async (type, dni, res) => {
  const { db, listName } = switchFunction(type);

  db.findOne(
    {
      dni,
    },
    async (err, info) => {
      if (err) {
        res.status(401).json(err);
      }

      info[listName].forEach((info) => {
        info.spent = 0;
      });

      await info.save((err) => {
        if (err) {
          res.status(401).json(err);
        }

        res.status(200).json(info);
      });
    }
  );
};

module.exports = resetSpent;
