const generateColor = () => {
    //const color = Math.floor(Math.random() * 16777215).toString(16);
    const color = "hsl(" + Math.random() * 360 + ", 70%, 75%)";
    return `${color}`;
}

module.exports = generateColor;