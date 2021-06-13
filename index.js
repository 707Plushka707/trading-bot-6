require('dotenv').config();
const MartingaleStrategy = require('./strategy/martingale');

const CONFIG = {
    symbol: 'BNBUSDT'
}

const start = async () => {
    
    let strategy = new MartingaleStrategy({
        symbol:CONFIG.symbol, 
        leverage:10, 
        balance:1000,
        targetPercent:0.005
    });
    strategy.start();
    console.log("end");

}

start();

