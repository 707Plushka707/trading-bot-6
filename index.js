require('dotenv').config();
const MartingaleStrategy = require('./strategy/martingale');

const CONFIG = {
    symbol: 'BNBUSDT'
}

const start = async () => {
    
    let strategy = new MartingaleStrategy({symbol:CONFIG.symbol, leverage:100, balance:1000});
    strategy.start();
    console.log("end");

}

start();

