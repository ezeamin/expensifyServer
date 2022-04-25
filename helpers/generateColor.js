const generateColor = () => {
    const color = "hsl(" + Math.random() * 360 + ", 70%, 80%)";
    return `${color}`;
}

module.exports = generateColor;