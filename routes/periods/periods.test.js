/* eslint-disable no-undef */
const mongoose = require("mongoose");
const { api, randomNumber } = require("../../helpers/testFunctions");

afterAll(async () => {
  await mongoose.connection.close();
});

jest.setTimeout(10000);

const newPeriod = {
  start: new Date("2020-01-01"),
  end: new Date("2020-01-31"),
  days: 31,
  spent: randomNumber(5),
  income: randomNumber(4),
  incomes: [
    {
      id: randomNumber(6),
      title: "Ingreso 1",
      date: new Date("2020-01-03"),
      accountId: "456DEF",
      paymentDate: "2020-02-05",
      price: 55,
      description: "",
    },
  ],
  expenses: [
    {
      id: randomNumber(6),
      title: "Gasto 1",
      categoryId: "123ABC",
      accountId: "456DEF",
      date: new Date("2020-02-05"),
      price: 55,
      description: "",
    },
  ],
  transfers: [
    {
      id: randomNumber(6),
      date: new Date("2020-02-05"),
      title: "Transferencia 1",
      price: 55,
      description: "",
      originAccountId: "456DEF",
      destinationAccountId: "789GHI",
    },
  ],
};

describe("Edit Document", () => {
  test("New period", async () => {
    await api
      .put("/api/period")
      .send(newPeriod)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.periods.length).toBe(1);
        expect(res.body.periods[0].start).toBe(newPeriod.start.toISOString());
        expect(res.body.periods[0].end).toBe(newPeriod.end.toISOString());
        expect(res.body.periods[0].days).toBe(newPeriod.days);
        expect(res.body.periods[0].spent).toBe(newPeriod.spent);
        expect(res.body.periods[0].income).toBe(newPeriod.income);
        expect(res.body.periods[0].incomes.length).toBe(1);
        expect(res.body.periods[0].incomes[0].title).toBe(
          newPeriod.incomes[0].title
        );
        expect(res.body.periods[0].expenses.length).toBe(1);
        expect(res.body.periods[0].expenses[0].title).toBe(
          newPeriod.expenses[0].title
        );
        expect(res.body.periods[0].transfers.length).toBe(1);
        expect(res.body.periods[0].transfers[0].title).toBe(
          newPeriod.transfers[0].title
        );
      });
  });

  test("Invalid period", async () => {
    const invalidPeriod = [
      {
        start: new Date("2020-01-01"),
        end: new Date("2020-01-31"),
        days: 35, // Invalid days
        spent: randomNumber(5),
        income: randomNumber(4),
        incomes: [
          {
            id: randomNumber(6),
            title: "Ingreso 1",
            date: new Date("2020-01-03"),
            accountId: "456DEF",
            paymentDate: "2020-02-05",
            price: 55,
            description: "",
          },
        ],
        expenses: [
          {
            id: randomNumber(6),
            title: "Gasto 1",
            categoryId: "123ABC",
            accountId: "456DEF",
            date: new Date("2020-02-05"),
            price: 55,
            description: "",
          },
        ],
        transfers: [
          {
            id: randomNumber(6),
            date: new Date("2020-02-05"),
            title: "Transferencia 1",
            price: 55,
            description: "",
            originAccountId: "456DEF",
            destinationAccountId: "789GHI",
          },
        ],
      },
      {
        start: new Date("2020-01-01"),
        end: new Date("2020-01-31"),
        days: 31,
        spent: randomNumber(5), //missing income
        incomes: [
          {
            id: randomNumber(6),
            title: "Ingreso 1",
            date: new Date("2020-01-03"),
            accountId: "456DEF",
            paymentDate: "2020-02-05",
            price: 55,
            description: "",
          },
        ],
        expenses: [
          {
            id: randomNumber(6),
            title: "Gasto 1",
            categoryId: "123ABC",
            accountId: "456DEF",
            date: new Date("2020-02-05"),
            price: 55,
            description: "",
          },
        ],
        transfers: [
          {
            id: randomNumber(6),
            date: new Date("2020-02-05"),
            title: "Transferencia 1",
            price: 55,
            description: "",
            originAccountId: "456DEF",
            destinationAccountId: "789GHI",
          },
        ],
      },
      {
        start: new Date("2020-01-01"),
        end: new Date("2020-01-31"),
        days: 31,
        spent: randomNumber(5),
        income: randomNumber(4),
        incomes: [
          {
            id: randomNumber(6),
            title: "Ingreso 1",
            date: new Date("2020-01-03"),
            accountId: "456DEF",
            paymentDate: "2020-02-05",
            price: 55,
            description: "",
          },
        ],
        expenses: [
          {
            id: randomNumber(6),
            title: "Gasto 1",
            categoryId: "123ABC",
            accountId: "456DEF",
            date: new Date("2020-02-05"),
            price: 55,
            description: "",
          },
        ],
        transfers: [
          {
            id: randomNumber(6),
            date: new Date("2020-02-05"),
            title: "Transferencia 1", //missing price
            description: "",
            originAccountId: "456DEF",
            destinationAccountId: "789GHI",
          },
        ],
      },
    ];

    for (let i = 0; i < invalidPeriod.length; i++) {
      await api
        .put("/api/period")
        .send(invalidPeriod[i])
        .then((res) => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe("Datos inválidos");
        });
    }
  });
});

describe("Get document", () => {
  test("Get document", async () => {
    await api.get("/api/periods").then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.periods.length).toBe(1);
      expect(res.body.periods[0].start).toBe(newPeriod.start.toISOString());
      expect(res.body.periods[0].end).toBe(newPeriod.end.toISOString());
      expect(res.body.periods[0].days).toBe(newPeriod.days);
      expect(res.body.periods[0].spent).toBe(newPeriod.spent);
      expect(res.body.periods[0].income).toBe(newPeriod.income);
      expect(res.body.periods[0].incomes.length).toBe(1);
      expect(res.body.periods[0].incomes[0].title).toBe(
        newPeriod.incomes[0].title
      );
      expect(res.body.periods[0].expenses.length).toBe(1);
      expect(res.body.periods[0].expenses[0].title).toBe(
        newPeriod.expenses[0].title
      );
      expect(res.body.periods[0].transfers.length).toBe(1);
      expect(res.body.periods[0].transfers[0].title).toBe(
        newPeriod.transfers[0].title
      );
    });
  });
});
