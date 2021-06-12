require('dotenv').config();
const MartingaleStrategy = require('./strategy/martingale');

const CONFIG = {
    symbol: 'BTCUSDT'
}

const start = async () => {
    
    let strategy = new MartingaleStrategy({symbol:CONFIG.symbol});
    strategy.start();
    console.log("end");

}

start();

