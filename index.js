require('dotenv').config();
const MartingaleStrategy = require('./strategy/martingale');

const CONFIG = {
    symbol: 'BELUSDT',
    leverage:100, 
    balance:1000,
    targetPercent:0.005
}

const simulation = () => {
    return new Promise((resolve, reject) => {
        let strategy = new MartingaleStrategy(CONFIG);
        strategy.start();
        resolve();
    });
}

  
const start = async () => {

    simulation().then(() => console.log('end 1'));
    console.log("end 2");

}

start();

