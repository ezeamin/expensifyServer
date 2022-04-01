function stringify(str,mode){
    return mode ? (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()).trim() : (str.charAt(0).toUpperCase() + str.slice(1)).trim();
}

module.exports = stringify;