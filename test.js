let a = 60.249;
let b = parseFloat(1);

let p = precision(b);
console.log(p)
console.log(precise(a, p));

function precision(number) {
    console.log(typeof number);
    if(Math.floor(number.valueOf()) === number.valueOf()) return 0;
    return number.toString().split(".")[1].length || 0; 
}

function precise(x, precision) {
    const mutiplier = 10 ** (precision);
    return Math.floor(x * mutiplier) / mutiplier
}