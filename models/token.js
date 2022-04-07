const mongoose = require("mongoose");
const { Schema } = mongoose;

const tokenSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    token: String,
});

module.exports = mongoose.model("Tokens", tokenSchema);