/* eslint-disable no-undef */
const mongoose = require("mongoose");
const { api, randomNumber } = require("../../helpers/testFunctions");

afterAll(async () => {
  await mongoose.connection.close();
});

jest.setTimeout(10000);

const data = {
  dni: "12345678",
  title: "Efectivo",
  icon: "fa-solid fa-test",
  color: "#fff2a1",
  accountType: "Efectivo",
  balance: 10400,
  description: "",
};

let accountId;

describe("Modify existing document", () => {
  test("Valid new account", async () => {
    await api
      .put("/api/account")
      .send(data)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.accounts.length).toBe(1);
        expect(res.body.accounts[0].title).toBe(data.title);
        expect(res.body.accounts[0].icon).toBe(data.icon);
        expect(res.body.accounts[0].color).toBe(data.color);
        expect(res.body.accounts[0].accountType).toBe(data.accountType);
        expect(res.body.accounts[0].balance).toBe(data.balance);
        expect(res.body.accounts[0].spent).toBe(0);
        expect(res.body.accounts[0].description).toBe(data.description);
        expect(res.body.accounts[0].noBalance).toBe(false);

        accountId = res.body.accounts[0].id;
      });
  });

  test("Invalid new account", async () => {
    const data = [
      {
        dni: randomNumber(5), // invalid dni
        title: "Efectivo",
        icon: "fa-solid fa-test",
        color: "#fff2a1",
        accountType: "Efectivo",
        balance: 10400,
        description: "",
      },
      {
        dni: "12345678",
        title: "E", // incorrect name
        icon: "fa-solid fa-test",
        color: "#fff2a1",
        accountType: "Efectivo",
        balance: 10400,
        description: "",
      },
      {
        dni: "12345678",
        title: "Eze",
        icon: "fa-solid fa-test",
        color: "#fff2a1", // no balance property
        accountType: "Efectivo",
        description: "",
      },
    ];

    for (let i = 0; i < data.length; i++) {
    await api
      .put("/api/account")
      .send(data[i])
      .then((res) => {
        expect(res.status).toBe(401);
      });
    }
  });

  test("Edit existing account", async () => {
    const newData = {
      dni: "12345678",
      spent: 500,
    };

    await api
      .put(`/api/account/${accountId}`)
      .send(newData)
      .then((res) => {
        let accountIndex = res.body.accounts.findIndex(
          (account) => account.id === accountId
        );

        expect(res.status).toBe(200);
        expect(res.body.accounts[accountIndex].spent).toBe(newData.spent);
      });
  });
});

describe("Get Account Documents", () => {
  test("Valid get account", async () => {
    await api.get("/api/accounts").then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.accounts[0].title).toBe(data.title);
      expect(res.body.accounts[0].icon).toBe(data.icon);
      expect(res.body.accounts[0].color).toBe(data.color);
      expect(res.body.accounts[0].accountType).toBe(data.accountType);
      expect(res.body.accounts[0].balance).toBe(data.balance);
      expect(res.body.accounts[0].spent).toBe(500);
      expect(res.body.accounts[0].description).toBe(data.description);
      expect(res.body.accounts[0].noBalance).toBe(false);
    });
  });
});

describe("New period actions", () => {
  test("Reset all account's spent", async () => {
    await api
      .put("/api/accounts/reset")
      .send({
        dni: "12345678",
      })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.accounts[0].spent).toBe(0);
      });
  });
});

describe("Delete account", () => {
  test("Valid delete account", async () => {
    await api
      .delete(`/api/account/${accountId}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.accounts.length).toBe(0);
      });
  });
});