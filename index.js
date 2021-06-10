require('dotenv').config();
const BinanceService = require('./service/binance.js');
const DummyService = require('./service/dummy.js');
const Binance = require('node-binance-api');
const fs = require('fs');

const CONFIG = {
    symbol: 'BTCUSDT'
}

const start = async () => {
    
    let dummyService = new DummyService(CONFIG.symbol);
    dummyService.listen((e) => {
        console.log(e.markPrice);
    });
}

start();

