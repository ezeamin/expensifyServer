const generarCodigo = require("../generarCodigo");
const initiate = require("./initiate");

const DbUsers = require("../../models/user");
const DbAccounts = require("../../models/account");
const DbExpenses = require("../../models/expense");
const DbIncomes = require("../../models/income");
const DbTransfers = require("../../models/transfer");
const DbDebts = require("../../models/debt");
const DbPayments = require("../../models/payment");
const DbCategories = require("../../models/category");
const DbOlds = require("../../models/period");

const clearDb = async (dni) => {
  await DbUsers.deleteMany({dni});
  await DbAccounts.deleteMany({dni});
  await DbExpenses.deleteMany({dni});
  await DbIncomes.deleteMany({dni});
  await DbTransfers.deleteMany({dni});
  await DbCategories.deleteMany({dni});
  await DbOlds.deleteMany({dni});
  await DbDebts.deleteMany({dni});
  await DbPayments.deleteMany({dni});
  console.log("Dropped all data successfully");
};

const loadMockData = () => {
  // const user = await DbUsers.findOne({ dni });
  const currentMonth = new Date().getMonth();

  const dni = "43706393";

  console.clear();
  console.log("Loading Mock Data");
  console.log("This process should take a while");
  clearDb(dni);

  setTimeout(async () => {
    initiate(dni, 75000);
    const newUser = new DbUsers({
      email: "hola@gmail.com",
      name: "Juan",
      dni,
      recCode: "123456",
      incorporation: new Date(),
      currentPeriod: currentMonth,
      shouldSeeStatus: true,
    });

    newUser.password = await newUser.encryptPassword("123456aA");
    await newUser.save();

    console.clear();
    console.log("Created default user successfully");
    console.log("DNI: " + dni);
    console.log("Password: 123456aA");
    console.log(" ");
    console.log("Loading documents...");

    setTimeout(async () => {
      const accountsDoc = await DbAccounts.findOne({ dni });
      const expensesDoc = await DbExpenses.findOne({ dni });
      const incomesDoc = await DbIncomes.findOne({ dni });
      const transfersDoc = await DbTransfers.findOne({ dni });
      const categoriesDoc = await DbCategories.findOne({ dni });
      // const periodsDoc = await DbPeriods.findOne({ dni });
      // const paymentsDoc = await DbPayments.findOne({ dni });
      // const debtsDoc = await DbDebts.findOne({ dni });

      for (let i = 0; i < 10; i++) {
        const newAccount = {
          id: generarCodigo(8),
          title: `Cuenta ${i}`,
          icon: "fa-regular fa-bills",
          color: "#aaa",
          accountType: "Efectivo",
          balance: Math.round(Math.random() * 10000),
          spent: Math.round(Math.random() * 10000),
          description: `Cuenta ${i}`,
          noBalance: false,
        };

        accountsDoc.accounts.push(newAccount);

        await accountsDoc.save();
      }

      for (let i = 0; i < 5; i++) {
        const newCategory = {
          id: generarCodigo(8),
          title: `Categoria ${i}`,
          icon: "fa-regular fa-bills",
          limit: Math.round(Math.random() * 100000),
          spent: Math.round(Math.random() * 10000),
          color: "#aaa",
          description: `Cuenta ${i}`,
        };

        categoriesDoc.categories.push(newCategory);

        await categoriesDoc.save();
      }

      for (let i = 0; i < 20; i++) {
        const newExpense = {
          id: generarCodigo(8),
          title: `Gasto ${i}`,
          categoryId: "123456",
          accountId: "123456",
          date: new Date(2022, currentMonth, i),
          price: Math.round(Math.random() * 100000),
          description: `Cuenta ${i}`,
          modified: false,
        };

        expensesDoc.expenses.push(newExpense);

        await expensesDoc.save();
      }

      let total = 0;
      for (let i = 0; i < 15; i++) {
        const value = Math.round(Math.random() * 100000);
        const newIncome = {
          id: generarCodigo(8),
          title: `Gasto ${i}`,
          date: new Date(2022, currentMonth, i + 10),
          price: value,
          description: `Cuenta ${i}`,
          accountId: "123456",
          modified: false,
        };

        total += value;

        incomesDoc.incomes.push(newIncome);
      }
      incomesDoc.totalIncome = total;

      await incomesDoc.save();

      for (let i = 0; i < 3; i++) {
        const newTransfer = {
          id: generarCodigo(8),
          date: new Date(2022, currentMonth, i + 10),
          time: "12:00",
          price: Math.round(Math.random() * 100000),
          description: `Cuenta ${i}`,
          originAccountId: "123456",
          destinationaccountId: "654321",
          modified: false,
        };

        transfersDoc.transfers.push(newTransfer);

        await transfersDoc.save();

      }
      console.log("");
      console.log("Loaded mock data successfully!");
    }, 3000);
  }, 8000);
};

module.exports = loadMockData;
