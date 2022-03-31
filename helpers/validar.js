function validar(datos) {
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
        if (!validateString(valor) || valor.length > 20 || valor.length < 2) {
          return false;
        }
        break;
      case "title":
        if (valor.length > 20 || valor.length < 2) {
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
        if (!/^[0-9]{1,6}$/i.test(valor) || Number.parseFloat(valor) === 0) {
          return false;
        }
        break;
      }
      case "account":
      case "originAccount":
      case "destinationAccount":
      case "category":
        if (valor === "0") {
          return false;
        }
        break;
      default:
        break;
    }
  }

  return true;
}

function validateString(str) {
  const re = /^[A-Za-z\sáéíóú]+$/;
  return re.test(str) ? true : false;
}

module.exports = validar;
