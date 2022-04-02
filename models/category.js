const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  id: String,
  title: String,
  icon: String,
  limit: Number,
  spent: Number,
  color: String,
  description: String,
});

const userCategorySchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  categories: [categorySchema],
});

module.exports = mongoose.model("Categories", userCategorySchema);
