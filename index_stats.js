require('dotenv').config();
const MartingaleStrategy = require('./strategy/martingale');
const {getSymbols} = require('./dummystats');
const fs = require('fs');

const CONFIG = {
    symbol: 'BELUSDT',
    leverage:100, 
    balance:1000,
    targetPercent:0.005,
    mode:'dummy'
}

const results = [];

const executeStrategy = (symbol) => {
    return new Promise((resolve, reject) => {

        results.push(symbol);

        let strategy = new MartingaleStrategy({...CONFIG, symbol});

        strategy.on('close', (data) => {
            results[symbol] = data;

        });

        strategy.start();
        resolve();
    });
}

  
const start = async () => {


    const outputPath = "./output";
    const outputFile = "result.txt";
    if (fs.existsSync(outputPath)) {
        fs.rmdirSync(outputPath, { recursive: true });
    }
    fs.mkdirSync(outputPath);

    let symbols = getSymbols();
    // symbols = ['BTCUSDT','BNBUSDT'];
    symbols.forEach(symbol => {

        executeStrategy(symbol)
        
    })

    results.forEach(r => {
        const log = Object.values(results[r]).join('\t') + '\n';
        fs.writeFileSync(outputPath + '/' + outputFile, log, { flag: "a+" })

    })

    console.log("end index.js");

}

start();

