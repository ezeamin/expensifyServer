/* eslint-disable no-undef */
const mongoose = require("mongoose");
const {
  api,
  randomNumber,
  randomString,
} = require("../../helpers/testFunctions");
const DbCategory = require("../../models/category");

beforeAll(async () => {
  await DbCategory.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Create new category", () => {
  test("Invalid data new category", async () => {
    await api
      .post("/api/category")
      .send({
        dni: "pepe", // invalid dni
        title: "Alimentos",
        icon: "fa-solid fa-test",
        limit: "15000",
        color: "#aabbcc",
        description: "",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/category")
      .send({
        dni: randomNumber(8),
        title: "A", //incorrect name
        icon: "fa-solid fa-test",
        limit: "15000",
        color: "#aabbcc",
        description: "",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/category")
      .send({
        dni: randomNumber(8),
        title: "Alimentos",
        icon: "f", //incorrect icon
        limit: "15000",
        color: "#aabbcc",
        description: "",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/category")
      .send({
        dni: randomNumber(8),
        title: "Alimentos",
        icon: "fa-solid fa-test",
        limit: "150a", //incorrect limit
        color: "#aabbcc",
        description: "",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/category")
      .send({
        dni: randomNumber(8),
        title: "Alimentos",
        icon: "fa-solid fa-test",
        limit: "150a",
        color: "#a", //incorrect color
        description: "",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });

    await api
      .post("/api/category")
      .send({
        dni: randomNumber(8),
        title: "Alimentos",
        icon: "fa-solid fa-test", // missing limit
        color: "#aabbcc",
        description: "",
      })
      .then((res) => {
        expect(res.status).toBe(401);
      });
  });

  test("Valid data new category", async () => {
    await api
      .post("/api/category")
      .send({
        dni: "12345678",
        title: "Alimentos",
        icon: "fa-solid fa-test",
        limit: "15000",
        color: "#aabbcc",
        description: "Hola",
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });

    await api
      .post("/api/category")
      .send({
        dni: randomNumber(8),
        title: randomString(10),
        icon: "fa-solid",
        limit: "15000",
        color: "#aabbdd",
        description: "", //empty description
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });
});

describe("Get categories", () => {
  test("Get category document and categories", async () => {
    await api.get("/api/categories").then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.dni).toBe("12345678");
      expect(res.body.categories.length).toBe(1);
    });
  });
});

var categoryId;

describe("Edit documents", () => {
  test("Add new category", async () => {
    await api
      .put("/api/category")
      .send({
        dni: "12345678",
        title: "categoria 2",
        icon: "fa-solid fa-test2",
        limit: "75000",
        color: "#aabbcc",
        description: "",
      })
      .then((res) => {
        expect(res.status).toBe(200);
        categoryId = res.body.categories[1].id;
        expect(res.body.categories.length).toBe(2);
        expect(res.body.categories[1].title).toBe("Categoria 2");
      });
  });

  test("Edit category", async () => {
    await api
      .put(`/api/category/${categoryId}`)
      .send({
        dni: "12345678",
        spent: 100,
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });

    await api.get(`/api/categories`).then((res) => {
      let categoryIndex = res.body.categories.findIndex(
        (category) => category.id === categoryId
      );

      expect(res.status).toBe(200);
      expect(res.body.categories[categoryIndex].spent).toBe(100);
    });
  });
});

describe("Delete documents", () => {
  test("Delete category", async () => {
    await api
      .delete(`/api/category/${categoryId}`)
      .send({
        dni: "12345678",
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });

    await api.get(`/api/categories`).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.categories.length).toBe(1);
    });
  });
});

describe("New period actions", () => {
  test("Reset spent attribute in all categories", async () => {
    await api
      .put("/api/categories/reset")
      .send({
        dni: "12345678",
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });

    await api.get("/api/categories").then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.categories[0].spent).toBe(0);
    });
  });
});
