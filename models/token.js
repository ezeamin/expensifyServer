const mongoose = require("mongoose");
const { Schema } = mongoose;

const tokenSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: false,
    },
    isMobile: {
        type: Boolean,
        unique: false,
    },
    browser: {
        type: String,
        unique: false,
    },
    os: {
        type: String,
        unique: false,
    },
    token: String,
});

module.exports = mongoose.model("Tokens", tokenSchema);