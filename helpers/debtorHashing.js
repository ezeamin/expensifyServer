const hashing = (str) => {
  let hash = "";
  str = str.toLowerCase().trim();
  
  for (let i = 0; i < str.length; i++) {
    hash += Number.parseInt((str.charCodeAt(i))/8) + "";
  }
  return hash;
};

module.exports = hashing;
