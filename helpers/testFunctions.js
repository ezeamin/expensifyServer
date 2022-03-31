const supertest = require("supertest");
const app = require("../server");

const randomNumber = (n) => {
  return Math.floor(Math.random() * Math.pow(10, n));
};

const randomString = (n) => {
  let s = "";
  while (s.length < n) {
    s += Math.random().toString(36).substring(2);
  }
  return s.substring(0, n);
};

const randomEmail = () => {
  return `test${randomNumber(5)}@test.com`;
};

const api = supertest(app);

module.exports = {
  api,
  randomNumber,
  randomString,
  randomEmail
};
