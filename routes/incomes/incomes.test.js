/* eslint-disable no-undef */
const mongoose = require("mongoose");
const { api, randomNumber } = require("../../helpers/testFunctions");
const fs = require("fs");
const path = require("path");

afterAll(async () => {
  await mongoose.connection.close();
});

jest.setTimeout(10000);

let incomeId;
let token;

beforeAll(async () => {
  token =
    "Bearer " +
    fs.readFileSync(path.resolve(__dirname, "../../token.txt"), "utf8");
});

describe("Edit Document", () => {
  test("New income", async () => {
    const newIncomeData = {
      dni: "12345678",
      title: "Pago musica",
      accountId: "456DEF",
      price: 55,
      description: "",
    };

    await api
      .put("/api/income")
      .set('Authorization', token)
      .send(newIncomeData)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.incomes.length).toBe(1);
        expect(res.body.incomes[0].title).toBe(newIncomeData.title);
        expect(res.body.incomes[0].accountId).toBe(newIncomeData.accountId);
        expect(res.body.incomes[0].price).toBe(newIncomeData.price);
        expect(res.body.incomes[0].description).toBe(
          newIncomeData.description
        );

        incomeId = res.body.incomes[0].id;
      });
  });

  test("Edit income document", async () => {
    const newTitle = "Pago clase";
    const newPrice = randomNumber(3);

    await api
      .put(`/api/income/${incomeId}`)
      .set('Authorization', token)
      .send({
        dni: "12345678",
        title: newTitle,
        price: newPrice,
      })
      .then((res) => {
        expect(res.status).toBe(200);

        const incomeIndex = res.body.incomes.findIndex(
          (income) => income.id === incomeId
        );

        expect(res.body.incomes[incomeIndex].title).toBe(newTitle);
        expect(res.body.incomes[incomeIndex].price).toBe(newPrice);
      });
  });

  test("Invalid edit income document", async () => {
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
      .put(`/api/income/${incomeId}`)
      .set('Authorization', token)
      .send(data[0])
      .then((res) => {
        expect(res.status).toBe(404);
      });

    await api
      .put(`/api/income/${incomeId}`)
      .set('Authorization', token)
      .send(data[1])
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });
});

describe("Get Incomes", () => {
  test("Get income document and incomes", async () => {
    await api.get("/api/incomes")
    .set('Authorization', token).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.dni).toBe("12345678");
      expect(res.body.incomes.length).toBe(1);
    });
  });
});

describe("Delete income", () => {
  test("Delete income", async () => {
    await api.delete(`/api/income/${incomeId}`)
    .set('Authorization', token).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.incomes.length).toBe(0);
    });
  });
});
