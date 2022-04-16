const validar = (datos) => {
  for (let i = 0; i < Object.keys(datos).length; i++) {
    let valor = Object.values(datos)[i];

    //console.log(valor);
    switch (Object.keys(datos)[i]) {
      case "dni":
        if (!/^\d{7,8}$/i.test(valor) || valor <= 0) {
          return false;
        }
        break;
      case "name":
      case "accountType":
        if (!validateString(valor) || valor.length > 20 || valor.length < 2) {
          return false;
        }
        break;
      case "title":
        if (valor.length > 20 || valor.length < 2) {
          return false;
        }
        break;
      case "color":
      case "accountColor":
      case "originAccountColor":
      case "destinationAccountColor":
        if (valor.length > 40 || valor.length < 2) {
          return false;
        }
        break;
      case "icon":
        if (valor.length > 30 || valor.length < 2) {
          return false;
        }
        break;
      case "email":
        if (
          valor.length > 40 ||
          valor.length < 3 ||
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(valor)
        ) {
          return false;
        }
        break;
      case "password":
        if (
          valor.length < 6 ||
          valor.length > 20 ||
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(valor)
        ) {
          return false;
        }
        break;
      case "price": {
        if (!/^\d+\.?\d*$/i.test(valor) || Number.parseFloat(valor) === 0) {
          return false;
        }
        break;
      }
      case "days":
        if(valor < 1 || valor > 31) return false;
        break;
      case "account":
      case "originAccount":
      case "destinationAccount":
      case "category":
        if (valor === "0") { //prueba al pedo con los nuevos select de mui
          return false;
        }
        break;
      case "paymentDate":
        if(!Object.keys(datos).includes("id") && !checkPayment(valor)) return false;
        break;
      default:
        break;
    }
  }

  return true;
}

const validateString = (str) => {
  const re = /^[A-Za-z\sáéíóú]+$/;
  return re.test(str) ? true : false;
};

const checkPayment = (date) => {
  let dateSplit = date.split("-");
  let year = dateSplit[0];
  let month = dateSplit[1];
  let day = dateSplit[2];

  let currentDate = new Date();

  if(year < currentDate.getFullYear() || month > 12 || day > 31 || month < 1 || day < 1) return false;

  if(month < currentDate.getMonth() + 1 && year === currentDate.getFullYear()) return false;

  if(day < currentDate.getDate() && year === currentDate.getFullYear() && month === currentDate.getMonth() + 1) return false;

  return true;
};

module.exports = validar;
