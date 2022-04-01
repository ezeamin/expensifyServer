const validarKeys = (type, obj) => {
    const keys = {
        newAccount: ["title", "icon", "color", "accountType", "balance", "description"],
        newCategory: ["title", "icon", "color", "limit", "description"],
        newTransfer: ["date", "time", "price", "description", "originAccount", "originAccountColor", "destinationAccount", "destinationAccountColor"],
        newIncome: ["title", "date", "time", "price", "description", "account", "accountColor"],
        newExpense: ["title", "icon", "category", "date", "time", "price", "description", "account", "accountColor"],
    };
    
    if (keys[type].every((key) => Object.keys(obj).includes(key))) {
        return true;
    }
    
    return false;
};

module.exports = validarKeys;
