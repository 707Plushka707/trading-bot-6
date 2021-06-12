require('dotenv').config();
const MartingaleStrategy = require('./strategy/martingale');

const CONFIG = {
    symbol: 'BTCUSDT'
}

const start = async () => {
    
    let strategy = new MartingaleStrategy({symbol:CONFIG.symbol, leverage:10});
    strategy.start();
    console.log("end");

}

start();

