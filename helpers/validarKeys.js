const validarKeys = (type, obj) => {
    const keys = {
        newAccount: ["title", "icon", "color", "accountType", "balance", "description"],
        newCategory: ["title", "icon", "color", "limit", "description"],
        newTransfer: ["price", "description", "originAccountId", "destinationAccountId"],
        newIncome: ["title", "price", "description", "accountId", "date"],
        newExpense: ["title", "categoryId", "price", "description", "accountId", "date"],
        newUserDebt: ["lenderName", "price", "description", "destinationAccountId"],
        newOtherDebt: ["debtorName", "price", "description", "originAccountId"],
        newPayment: ["title", "categoryId", "accountId", "paymentDate", "price", "description"],
        newPeriod: ["start", "end", "days", "spent", "income", "incomes", "expenses", "transfers"],
        newLimit: ["limit"],
    };
    
    if (keys[type].every((key) => Object.keys(obj).includes(key))) {
        return true;
    }
    
    return false;
};

module.exports = validarKeys;
