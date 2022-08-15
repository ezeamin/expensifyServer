const validarKeys = (type, obj) => {
    const keys = {
        newAccount: ["title", "icon", "color", "accountType", "balance", "description"],
        newCategory: ["title", "icon", "color", "limit", "description"],
        newTransfer: ["price", "description", "originAccountId", "destinationAccountId","date","tzOffset"],
        newIncome: ["title", "price", "description", "accountId", "date","tzOffset"],
        newExpense: ["title", "categoryId", "price", "description", "accountId", "date","tzOffset"],
        newUserDebt: ["lenderName", "price", "description", "destinationAccountId","date","tzOffset"],
        newOtherDebt: ["debtorName", "price", "description", "originAccountId","date","tzOffset"],
        newPayment: ["title", "categoryId", "accountId", "paymentDate", "price", "description","tzOffset"],
        newPeriod: ["start", "end", "days", "spent", "income", "incomes", "expenses", "transfers"],
        newLimit: ["limit"],
    };
    
    if (keys[type].every((key) => Object.keys(obj).includes(key))) {
        return true;
    }
    
    return false;
};

module.exports = validarKeys;
