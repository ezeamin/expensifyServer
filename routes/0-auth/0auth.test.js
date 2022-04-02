/* eslint-disable no-undef */
const mongoose = require("mongoose");
const {
  api,
} = require("../../helpers/testFunctions");

beforeAll(async () => {
  //drop database
  await mongoose.connection.dropDatabase();
});

afterAll(() => {
  mongoose.connection.close();
});

jest.setTimeout(10000);

describe("Sign up", () => {
  test("Valid data sign up", async () => {
    await api
      .post("/api/signup")
      .send({
        dni: "12345678",
        password: "123456aA",
        email: "ezequielamin@outlook.com",
        name: "Eze",
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  test("Invalid data sign up", async () => {
    await api
      .post("/api/signup")
      .send({
        name: "A", //incorrect name
        dni: "11245678",
        email: "eze@gmail.com",
        password: "123456aA",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/signup")
      .send({
        name: "Eze",
        dni: "1234567a", //incorrect dni
        email: "eze@gmail.com",
        password: "123456aA",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/signup")
      .send({
        name: "Eze",
        dni: "12349998",
        email: "eze@gmail", //incorrect email
        password: "123456aA",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/signup")
      .send({
        name: "Eze",
        dni: "12345118",
        email: "eze@gmail.com",
        password: "1234", //incorrect password
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/signup")
      .send({
        name: "Eze",
        dni: "12345678", //dni en uso
        email: "eze@gmail.com",
        password: "123456aA",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/signup")
      .send({
        name: "Eze",
        dni: "43706300",
        email: "ezequielamin@outlook.com", //email en uso
        password: "123456aA",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });

});

describe("Sign in", () => {
  test("Invalid data sign in", async () => {
    await api
      .post("/api/signin")
      .send({
        dni: "1234", //invalid dni
        password: "123456aA",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/signin")
      .send({
        dni: "12345678",
        password: "1234", //invalid password
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/signin")
      .send({
        dni: "43000000", //dni not registered
        password: "123456aA",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/signin")
      .send({
        dni: "12345678",
        password: "123456aB", //incorrect password
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });

  test("Valid data sign in", async () => {
    await api
      .post("/api/signin")
      .send({
        dni: "12345678",
        password: "123456aA",
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });
});
