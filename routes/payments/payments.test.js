/* eslint-disable no-undef */
const mongoose = require("mongoose");
const addNewMonth = require("../../helpers/addNewMonth");
const { api, randomNumber } = require("../../helpers/testFunctions");

afterAll(async () => {
  await mongoose.connection.close();
});

jest.setTimeout(10000);

const newPaymentData = {
  dni: "12345678",
  title: "Compra tienda",
  categoryId: "123ABC",
  accountId: "456DEF",
  paymentDate: "2025-02-05",
  price: 55,
  description: "",
};

var paymentId;

describe("Edit Document", () => {
  test("New payment", async () => {
    await api
      .put("/api/payment")
      .send(newPaymentData)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.payments.length).toBe(1);
        expect(res.body.payments[0].title).toBe(newPaymentData.title);
        expect(res.body.payments[0].categoryId).toBe(newPaymentData.categoryId);
        expect(res.body.payments[0].accountId).toBe(newPaymentData.accountId);
        expect(res.body.payments[0].price).toBe(newPaymentData.price);
        expect(res.body.payments[0].description).toBe(
          newPaymentData.description
        );

        paymentId = res.body.payments[0].id;
        console.log(paymentId);
      });
  });

  test("Edit payment document", async () => {
    const newTitle = "Compra super 2";
    const newPrice = randomNumber(3);

    await api
      .put(`/api/payment/${paymentId}`)
      .send({
        dni: "12345678",
        title: newTitle,
        price: newPrice,
      })
      .then((res) => {
        expect(res.status).toBe(200);

        const paymentIndex = res.body.payments.findIndex(
          (payment) => payment.id === paymentId
        );

        expect(res.body.payments[paymentIndex].title).toBe(newTitle);
        expect(res.body.payments[paymentIndex].price).toBe(newPrice);
      });
  });

  test("Invalid edit payment document", async () => {
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
      {
        dni: "12345678",
        title: "Compra super 2",
        price: randomNumber(3),
        paymentDate: "2020-01-01", // invalid paymentDate
        description: "",
      },
    ];

    await api
      .put(`/api/payment/${paymentId}`)
      .send(data[0])
      .then((res) => {
        expect(res.status).toBe(404);
      });

    await api
      .put(`/api/payment/${paymentId}`)
      .send(data[1])
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .put(`/api/payment/${paymentId}`)
      .send(data[2])
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });
});

describe("Get Payments", () => {
  test("Get payment document and payments", async () => {
    await api.get("/api/payments").then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.dni).toBe("12345678");
      expect(res.body.payments.length).toBe(1);
    });
  });
});

describe("Pay Payment", () => {
  test("Pay this period", async () => {
    console.log(paymentId);
    await api.put(`/api/payment/pay/${paymentId}`).then((res) => {
      console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.payments.length).toBe(1);
      expect(res.body.payments[0].paymentDate).toBe(
        addNewMonth(newPaymentData.paymentDate) + "T00:00:00.000Z"
      );
    });
  });
});

describe("Delete payment", () => {
  test("Delete payment", async () => {
    await api.delete(`/api/payment/${paymentId}`).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.payments.length).toBe(0);
    });
  });
});
