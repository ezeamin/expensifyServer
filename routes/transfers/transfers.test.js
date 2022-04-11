/* eslint-disable no-undef */
const mongoose = require("mongoose");
const { api, randomNumber } = require("../../helpers/testFunctions");
const fs = require("fs");
const path = require("path");

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

jest.setTimeout(10000);

let transferId;
let token;

beforeAll(async () => {
  token =
    "Bearer " +
    fs.readFileSync(path.resolve(__dirname, "../../token.txt"), "utf8");
});

describe("Edit Document", () => {
  test("New transfer", async () => {
    const newTransferData = {
      dni: "12345678",
      originAccountId: "456DEF",
      destinationAccountId: "789GHI",
      price: 55000,
      description: "Cambio papa",
    };

    await api
      .put("/api/transfer")
      .send(newTransferData)
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.transfers.length).toBe(1);
        expect(res.body.transfers[0].originAccountId).toBe(
          newTransferData.originAccountId
        );
        expect(res.body.transfers[0].destinationAccountId).toBe(
          newTransferData.destinationAccountId
        );
        expect(res.body.transfers[0].price).toBe(newTransferData.price);
        expect(res.body.transfers[0].description).toBe(
          newTransferData.description
        );

        transferId = res.body.transfers[0].id;
      });
  });

  test("Edit transfer document", async () => {
    const newDescription = "Extraccion";
    const newPrice = randomNumber(3);

    await api
      .put(`/api/transfer/${transferId}`)
      .set("Authorization", token)
      .send({
        dni: "12345678",
        description: newDescription,
        price: newPrice,
      })
      .then((res) => {
        expect(res.status).toBe(200);

        const transferIndex = res.body.transfers.findIndex(
          (transfer) => transfer.id === transferId
        );

        expect(res.body.transfers[transferIndex].description).toBe(
          newDescription
        );
        expect(res.body.transfers[transferIndex].price).toBe(newPrice);
      });
  });

  test("Invalid edit transfer document", async () => {
    const data = [
      {
        dni: "12345679", // non existing dni
        price: randomNumber(3),
        description: "",
      },
      {
        dni: "12345678",
        price: randomNumber(8), // invalid price
        description: "",
      },
    ];

    await api
      .put(`/api/transfer/${transferId}`)
      .set("Authorization", token)
      .send(data[0])
      .then((res) => {
        expect(res.status).toBe(404);
      });

    await api
      .put(`/api/transfer/${transferId}`)
      .set("Authorization", token)
      .send(data[1])
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });
});

describe("Get Transfers", () => {
  test("Get transfer document and transfers", async () => {
    await api
      .get("/api/transfers")
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.dni).toBe("12345678");
        expect(res.body.transfers.length).toBe(1);
      });
  });
});

describe("Delete transfer", () => {
  test("Delete transfer", async () => {
    await api
      .delete(`/api/transfer/${transferId}`)
      .set("Authorization", token)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.transfers.length).toBe(0);
      });
  });
});
