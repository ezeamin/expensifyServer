const DbCategories = require("../../models/category");

const updateCategoryValues = (dni, oldData) => {
  DbCategories.findOne(
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

      const categoryIndex = info.categories.findIndex(
        (category) => category.id === oldData.categoryId
      );

      const category = info.categories[categoryIndex];

      category.spent -= oldData.price;

      await info.save((err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  );
};

module.exports = updateCategoryValues;
