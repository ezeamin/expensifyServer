const mongoose = require("mongoose");
const { categorySchema } = require("./schemas");
const { Schema } = mongoose;

const userCategorySchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  categories: [categorySchema],
});

module.exports = mongoose.model("Categories", userCategorySchema);
