const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
  },
  icon: {
    type: String,
  },
  limit: {
    type: Number,
  },
  spent: {
    type: Number,
  },
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
