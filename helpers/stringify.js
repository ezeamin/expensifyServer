function stringify(str){
    return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()).trim();
}

module.exports = stringify;