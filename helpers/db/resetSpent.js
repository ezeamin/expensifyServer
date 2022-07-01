const switchFunction = (type) => {
  switch (type) {
    case "account":
      return { db: require("../../models/account"), listName: "accounts" };
    case "category":
      return { db: require("../../models/category"), listName: "categories" };
    default:
      return null;
  }
};

const resetSpent = async (type, dni) => {
  const { db, listName } = switchFunction(type);

  db.findOne(
    {
      dni,
    },
    async (err, info) => {
      if (err) {
        console.log(err);
      }

      info[listName].forEach((info) => {
        info.spent = 0;
      });

      await info.save();
    }
  );
};

module.exports = resetSpent;
