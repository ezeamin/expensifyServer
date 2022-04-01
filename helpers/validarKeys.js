const validarKeys = (type, obj) => {
    const keys = {
        newAccount: ["title", "icon", "color", "accountType", "balance", "description"],
        newCategory: ["title", "icon", "color", "limit", "description"],
    };
    
    if (keys[type].every((key) => Object.keys(obj).includes(key))) {
        return true;
    }
    
    return false;
};

module.exports = validarKeys;
