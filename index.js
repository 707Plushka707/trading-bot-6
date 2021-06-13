require('dotenv').config();
const MartingaleStrategy = require('./strategy/martingale');

const CONFIG = {
    symbol: 'BELUSDT',
    leverage:100, 
    balance:1000,
    targetPercent:0.005
}

const start = async () => {
    
    let strategy = new MartingaleStrategy(CONFIG);
    strategy.start();
    console.log("end");

}

start();

