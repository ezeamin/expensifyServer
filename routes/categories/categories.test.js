/* eslint-disable no-undef */
const mongoose = require("mongoose");
const {
  api,
  randomNumber,
  randomString,
} = require("../../helpers/testFunctions");
const DbCategory = require("../../models/category");

beforeAll(async() => {
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
        title: randomString(5),
        icon: "fa-solid fa-test",
        limit: "15000",
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
        description: "", //empty description
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });
});

describe("Get categories",()=>{
  test("Get category document", async () => {
    await api
      .get("/api/categories/12345678")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.dni).toBe("12345678"); // antes se agrega el documento
      });
  });

  test("Get invalid category document", async () => {
    await api
      .get("/api/categories/912")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toBe(null); 
      });
  });

  test("Get categories from a document", async () => {
    await api
      .get("/api/categories/12345678")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.categories.length).toBe(1); // antes se agrega una categoria
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

    await api
      .get(`/api/categories/12345678`)
      .then((res) => {
        let categoryIndex = res.body.categories.findIndex(
          (category) => category.id === categoryId
        );

        //console.log(res.body.categories, categoryId, categoryIndex);

        expect(res.status).toBe(200);
        expect(res.body.categories[categoryIndex].spent).toBe(100);
      });
  });
});
