const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    maxlength: 40,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    maxlength: 20,
    required: true,
  },
  dni: {
    type: String,
    unique: true,
    required: true,
    maxlength: 8,
  },
  recCode: {
    type: String,
    unique: true,
  },
  incorporation: {
    type: Date,
    required: true,
  },
  currentPeriod: {
    type: Number,
    required: true,
  },
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, 10)
};

userSchema.methods.comparePassword = (password,password2) =>{
  return bcrypt.compareSync(password, password2);
};

module.exports = mongoose.model('User', userSchema);
