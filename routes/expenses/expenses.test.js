/* eslint-disable no-undef */
const mongoose = require("mongoose");
const { api, randomNumber } = require("../../helpers/testFunctions");
const fs = require("fs");
const path = require("path");

afterAll(async () => {
  await mongoose.connection.close();
});

jest.setTimeout(10000);

let expenseId;
let token;

beforeAll(async () => {
  token =
    "Bearer " +
    fs.readFileSync(path.resolve(__dirname, "../../token.txt"), "utf8");
});

describe("Edit Document", () => {
  test("New expense", async () => {
    const newExpenseData = {
      dni: "12345678",
      title: "Compra tienda",
      categoryId: "123ABC",
      accountId: "456DEF",
      price: 55,
      description: "",
    };

    await api
      .put("/api/expense")
      .send(newExpenseData)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.expenses.length).toBe(1);
        expect(res.body.expenses[0].title).toBe(newExpenseData.title);
        expect(res.body.expenses[0].categoryId).toBe(newExpenseData.categoryId);
        expect(res.body.expenses[0].accountId).toBe(newExpenseData.accountId);
        expect(res.body.expenses[0].price).toBe(newExpenseData.price);
        expect(res.body.expenses[0].description).toBe(
          newExpenseData.description
        );

        expenseId = res.body.expenses[0].id;
      });
  });

  test("Edit expense document", async () => {
    const newTitle = "Compra super 2";
    const newPrice = randomNumber(3);

    await api
      .put(`/api/expense/${expenseId}`)
      .set('Authorization', token)
      .send({
        dni: "12345678",
        title: newTitle,
        price: newPrice,
      })
      .then((res) => {
        expect(res.status).toBe(200);

        const expenseIndex = res.body.expenses.findIndex(
          (expense) => expense.id === expenseId
        );

        expect(res.body.expenses[expenseIndex].title).toBe(newTitle);
        expect(res.body.expenses[expenseIndex].price).toBe(newPrice);
      });
  });

  test("Invalid edit expense document", async () => {
    const data = [
      {
        dni: "12345679", // non existing dni
        title: "Compra super 2",
        price: randomNumber(3),
        description: "",
      },
      {
        dni: "12345678",
        title: "Compra super 2",
        price: randomNumber(8), // invalid price
        description: "",
      },
    ];

    await api
      .put(`/api/expense/${expenseId}`)
      .set('Authorization', token)
      .send(data[0])
      .then((res) => {
        expect(res.status).toBe(404);
      });

    await api
      .put(`/api/expense/${expenseId}`)
      .set('Authorization', token)
      .send(data[1])
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });
});

describe("Get Expenses", () => {
  test("Get expense document and expenses", async () => {
    await api.get("/api/expenses")
    .set('Authorization', token).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.dni).toBe("12345678");
      expect(res.body.expenses.length).toBe(1);
    });
  });
});

describe("Delete expense", () => {
  test("Delete expense", async () => {
    await api.delete(`/api/expense/${expenseId}`)
    .set('Authorization', token).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.expenses.length).toBe(0);
    });
  });
});
