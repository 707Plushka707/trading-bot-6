require('dotenv').config();
const MartingaleStrategy = require('./strategy/martingale');

const CONFIG = {
    symbol: 'BTCUSDT',
    leverage:10, 
    balance:1000,
    targetPercent:0.005,
    mode:'dummy'
}

const executeStrategy = () => {
    return new Promise((resolve, reject) => {
        let strategy = new MartingaleStrategy(CONFIG);
        strategy.start();
        resolve();
    });
}

  
const start = async () => {

    executeStrategy();
    console.log("end index.js");

}

start();

