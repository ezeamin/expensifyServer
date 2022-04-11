/* eslint-disable no-undef */
const mongoose = require("mongoose");
const { api } = require("../../helpers/testFunctions");
const fs = require("fs");
const path = require("path");

afterAll(async () => {
  await mongoose.connection.close();
});

jest.setTimeout(10000);

let personUserId, debtUserId, personOtherId, debtOtherId, debtOtherIdExtra;
let token;

beforeAll(async () => {
  token =
    "Bearer " +
    fs.readFileSync(path.resolve(__dirname, "../../token.txt"), "utf8");
});

describe("Edit Document", () => {
  describe("User debts", () => {
    test("New person", async () => {
      const newPersonData = {
        dni: "12345678",
        lenderName: "Juan Perez",
        destinationAccountId: "456DEF",
        price: 55000,
        description: "Trago recor",
      };

      await api
        .put("/api/debt/user")
        .set("Authorization", token)
        .send(newPersonData)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.userDebts.length).toBe(1);
          expect(res.body.userDebts[0].lenderName).toBe(
            newPersonData.lenderName
          );
          expect(res.body.userDebts[0].debts[0].destinationAccountId).toBe(
            newPersonData.destinationAccountId
          );
          expect(res.body.userDebts[0].debts[0].price).toBe(
            newPersonData.price
          );
          expect(res.body.userDebts[0].debts[0].description).toBe(
            newPersonData.description
          );

          personUserId = res.body.userDebts[0].id;
        });
    });

    test("New debt same person", async () => {
      const newDebtData = {
        dni: "12345678",
        lenderName: "Juan Perez",
        destinationAccountId: "123ABC",
        price: 240,
        description: "Cualquier cosa",
      };

      await api
        .put(`/api/debt/user`)
        .set("Authorization", token)
        .send(newDebtData)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.userDebts.length).toBe(1);
          expect(res.body.userDebts[0].lenderName).toBe(newDebtData.lenderName);
          expect(res.body.userDebts[0].debts[1].destinationAccountId).toBe(
            newDebtData.destinationAccountId
          );
          expect(res.body.userDebts[0].debts[1].price).toBe(newDebtData.price);
          expect(res.body.userDebts[0].debts[1].description).toBe(
            newDebtData.description
          );

          debtUserId = res.body.userDebts[0].debts[1].id;
        });
    });

    test("New debt other person", async () => {
      const newDebtData = {
        dni: "12345678",
        lenderName: "Pepe Gomez",
        destinationAccountId: "500ABC",
        price: 500,
        description: "Cualquier cosa",
      };

      await api
        .put(`/api/debt/user`)
        .set("Authorization", token)
        .send(newDebtData)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.userDebts.length).toBe(2);
          expect(res.body.userDebts[1].lenderName).toBe(newDebtData.lenderName);
          expect(res.body.userDebts[1].debts[0].destinationAccountId).toBe(
            newDebtData.destinationAccountId
          );
          expect(res.body.userDebts[1].debts[0].price).toBe(newDebtData.price);
          expect(res.body.userDebts[1].debts[0].description).toBe(
            newDebtData.description
          );
        });
    });
  });

  describe("Other debts", () => {
    test("New person", async () => {
      const newPersonData = {
        dni: "12345678",
        debtorName: "Juan Perez",
        originAccountId: "456DEF",
        price: 55000,
        description: "Trago recor",
      };

      await api
        .put("/api/debt/other")
        .set("Authorization", token)
        .send(newPersonData)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.otherDebts.length).toBe(1);
          expect(res.body.otherDebts[0].debtorName).toBe(
            newPersonData.debtorName
          );
          expect(res.body.otherDebts[0].debts[0].originAccountId).toBe(
            newPersonData.originAccountId
          );
          expect(res.body.otherDebts[0].debts[0].price).toBe(
            newPersonData.price
          );
          expect(res.body.otherDebts[0].debts[0].description).toBe(
            newPersonData.description
          );

          personOtherId = res.body.otherDebts[0].id;
          debtOtherIdExtra = res.body.otherDebts[0].debts[0].id;
        });
    });

    test("New debt same person", async () => {
      const newDebtData = {
        dni: "12345678",
        debtorName: "Juan Perez",
        originAccountId: "123ABC",
        price: 240,
        description: "Cualquier cosa",
      };

      await api
        .put(`/api/debt/other`)
        .set("Authorization", token)
        .send(newDebtData)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.otherDebts.length).toBe(1);
          expect(res.body.otherDebts[0].debtorName).toBe(
            newDebtData.debtorName
          );
          expect(res.body.otherDebts[0].debts[1].originAccountId).toBe(
            newDebtData.originAccountId
          );
          expect(res.body.otherDebts[0].debts[1].price).toBe(newDebtData.price);
          expect(res.body.otherDebts[0].debts[1].description).toBe(
            newDebtData.description
          );

          debtOtherId = res.body.otherDebts[0].debts[1].id;
        });
    });

    test("New debt other person", async () => {
      const newDebtData = {
        dni: "12345678",
        debtorName: "Pepe Gomez",
        originAccountId: "500ABC",
        price: 500,
        description: "Cualquier cosa",
      };

      await api
        .put(`/api/debt/other`)
        .set("Authorization", token)
        .send(newDebtData)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.otherDebts.length).toBe(2);
          expect(res.body.otherDebts[1].debtorName).toBe(
            newDebtData.debtorName
          );
          expect(res.body.otherDebts[1].debts[0].originAccountId).toBe(
            newDebtData.originAccountId
          );
          expect(res.body.otherDebts[1].debts[0].price).toBe(newDebtData.price);
          expect(res.body.otherDebts[1].debts[0].description).toBe(
            newDebtData.description
          );
        });
    });
  });
});

describe("Get debts", () => {
  test("Get debts user and other", async () => {
    await api
      .get("/api/debts")
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(200);

        expect(res.body.userDebts.length).toBe(2);
        expect(res.body.userDebts[0].lenderName).toBe("Juan Perez");
        expect(res.body.userDebts[0].debts[0].destinationAccountId).toBe(
          "456DEF"
        );
        expect(res.body.userDebts[0].debts[0].price).toBe(55000);
        expect(res.body.userDebts[0].debts[0].description).toBe("Trago recor");

        expect(res.body.otherDebts.length).toBe(2);
        expect(res.body.otherDebts[0].debtorName).toBe("Juan Perez");
        expect(res.body.otherDebts[0].debts[0].originAccountId).toBe("456DEF");
        expect(res.body.otherDebts[0].debts[0].price).toBe(55000);
        expect(res.body.otherDebts[0].debts[0].description).toBe("Trago recor");
      });
  });
});

describe("Modify debt", () => {
  test("Modify user debt", async () => {
    const newData = {
      dni: "12345678",
      destinationAccountId: "AABBCC",
    };

    await api
      .put(`/api/debt/user/${personUserId}/${debtUserId}`)
      .set("Authorization", token)
      .send(newData)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.userDebts.length).toBe(2);
        expect(res.body.userDebts[0].debts[1].destinationAccountId).toBe(
          newData.destinationAccountId
        );
      });
  });

  test("Modify other debt", async () => {
    const newData = {
      dni: "12345678",
      originAccountId: "AABBCC",
    };

    await api
      .put(`/api/debt/other/${personOtherId}/${debtOtherId}`)
      .set("Authorization", token)
      .send(newData)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.otherDebts.length).toBe(2);
        expect(res.body.otherDebts[0].debts[1].originAccountId).toBe(
          newData.originAccountId
        );
      });
  });
});

describe("Delete debt", () => {
  test("Delete user debt", async () => {
    await api
      .delete(`/api/debt/user/${personUserId}/${debtUserId}`)
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.userDebts.length).toBe(2);
        expect(res.body.userDebts[0].debts.length).toBe(1);
      });
  });

  test("Delete other debt", async () => {
    await api
      .delete(`/api/debt/other/${personOtherId}/${debtOtherId}`)
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.otherDebts.length).toBe(2);
        expect(res.body.otherDebts[0].debts.length).toBe(1);
      });
  });

  test("Delete invalid debt", async () => {
    await api
      .delete(`/api/debt/other/${personOtherId}/123`)
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .delete(`/api/debt/other/456/${debtOtherId}`)
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });

  test("Delete other debt, erasing the object", async () => {
    await api
      .delete(`/api/debt/other/${personOtherId}/${debtOtherIdExtra}`)
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.otherDebts.length).toBe(1);
      });
  });
});
