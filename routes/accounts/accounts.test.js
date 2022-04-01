/* eslint-disable no-undef */
const mongoose = require("mongoose");
const { api, randomNumber } = require("../../helpers/testFunctions");
const DbAccounts = require("../../models/account");

beforeAll(async () => {
  await DbAccounts.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

const data = {
  dni: "12345678",
  title: "Efectivo",
  icon: "fa-solid fa-test",
  color: "#fff2a1",
  accountType: "Efectivo",
  balance: 10400,
  description: "",
};

describe("New Account Document", () => {
  test("Valid new account", async () => {
    await api
      .post("/api/account")
      .send(data)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.accounts[0].title).toBe(data.title);
        expect(res.body.accounts[0].icon).toBe(data.icon);
        expect(res.body.accounts[0].color).toBe(data.color);
        expect(res.body.accounts[0].accountType).toBe(data.accountType);
        expect(res.body.accounts[0].balance).toBe(data.balance);
        expect(res.body.accounts[0].spent).toBe(0);
        expect(res.body.accounts[0].description).toBe(data.description);
      });
  });

  test("Invalid new account", async () => {
    const data = [
      {
        dni: "12345678", // same dni
        title: "Efectivo",
        icon: "fa-solid fa-test",
        color: "#fff2a1",
        accountType: "Efectivo",
        balance: 10400,
        description: "",
      },
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
        dni: randomNumber(8),
        title: "E", // incorrect name
        icon: "fa-solid fa-test",
        color: "#fff2a1",
        accountType: "Efectivo",
        balance: 10400,
        description: "",
      },
      {
        dni: randomNumber(8),
        title: "Eze",
        icon: "fa-solid fa-test",
        color: "#fff2a1", // no balance property
        accountType: "Efectivo",
        description: "",
      },
    ];

    await api
      .post("/api/account")
      .send(data[0])
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/account")
      .send(data[1])
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/account")
      .send(data[2])
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/account")
      .send(data[3])
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });
});

describe("Get Account Documents", () => {
  test("Valid get account", async () => {
    await api.get("/api/accounts").then((res) => {
      expect(res.status).toBe(200);
      expect(res.body[0].accounts[0].title).toBe(data.title);
      expect(res.body[0].accounts[0].icon).toBe(data.icon);
      expect(res.body[0].accounts[0].color).toBe(data.color);
      expect(res.body[0].accounts[0].accountType).toBe(data.accountType);
      expect(res.body[0].accounts[0].balance).toBe(data.balance);
      expect(res.body[0].accounts[0].spent).toBe(0);
      expect(res.body[0].accounts[0].description).toBe(data.description);
    });
  });
});

let accountId;

describe("Modify existing document", () => {
  test("Valid new account", async () => {
    const newAccount = {
      dni: "12345678",
      title: "TC",
      icon: "fa-solid fa-test",
      color: "#fff2a1",
      accountType: "Efectivo",
      balance: 100,
      description: "",
    };

    await api
      .put("/api/account")
      .send(newAccount)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.accounts.length).toBe(2);
        expect(res.body.accounts[1].title).toBe(newAccount.title);
        expect(res.body.accounts[1].icon).toBe(newAccount.icon);
        expect(res.body.accounts[1].color).toBe(newAccount.color);
        expect(res.body.accounts[1].accountType).toBe(newAccount.accountType);
        expect(res.body.accounts[1].balance).toBe(newAccount.balance);
        expect(res.body.accounts[1].spent).toBe(0);
        expect(res.body.accounts[1].description).toBe(newAccount.description);

        accountId = res.body.accounts[1].id;
      });
  });

  test("Edit existing account", async () => {
    const newData = {
      dni: "12345678",
      spent: 500,
      balance: 9900,
    };

    await api
      .put(`/api/account/${accountId}`)
      .send(newData)
      .then((res) => {
        let accountIndex = res.body.accounts.findIndex(
          (account) => account.id === accountId
        );

        expect(res.status).toBe(200);
        expect(res.body.accounts[accountIndex].balance).toBe(newData.balance);
        expect(res.body.accounts[accountIndex].spent).toBe(newData.spent);
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
        expect(res.body.accounts[1].spent).toBe(0);
      });
  });
});

describe("Delete account", () => {
  test("Valid delete account", async () => {
    await api
      .delete(`/api/account/${accountId}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.accounts.length).toBe(1);
      });
  });
});
