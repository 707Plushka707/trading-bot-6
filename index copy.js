require('dotenv').config();
const BinanceService = require('./service/binance.js');
const DummyService = require('./service/dummy.js');
const Binance = require('node-binance-api');
const fs = require('fs');

const CONFIG = {
    symbol: 'BTCUSDT'
}

let nextMartingalePercent = 0.005;
let nextMartingaleUsdt = 0.0;
let balance = 10000;
let positionPercent = 0.01;
let positionAmount;

let longs = new Array();
let shorts = new Array();

positionAmount = balance * positionPercent;

let enableLogPrice = true;

setInterval(function(){ 
    enableLogPrice = true;
}, 1000);

const logPrice = (log) => {
    if(enableLogPrice) {
        console.log(log);
        enableLogPrice = false;
    }
}

const openLong = (price, qty) => {
    balance -= price * qty;

    if(balance < 0) {
        throw Error('Not enought funds : balance = ' + balance + ', qty = ' + qty);
    }

    longs.push({
        open:price,
        qty
    });

    totalOrderCount++;
}

const openShort = (price, qty) => {
    balance -= price * qty;

    if(balance < 0) {
        throw Error('Not enought funds : balance = ' + balance + ', qty = ' + qty);
    }

    shorts.push({
        open:price,
        qty
    });

    totalOrderCount++;
}

const tradeValue = (currentPrice) => {
    
    let tradeValue = 0;

    for(let i = 0; i< longs.length; i++) {
        let longOpenValue = (longs[i].qty) * currentPrice;
        tradeValue += longOpenValue;
    }

    for(let i = 0; i< shorts.length; i++) {
        let shortOpenValue = (shorts[i].qty) * shorts[i].open;
        let shortCurrentValue = (shorts[i].qty) * currentPrice;
        tradeValue += shortOpenValue + shortOpenValue - shortCurrentValue;
    }

    return tradeValue;

}

const PNL = (currentPrice) => {
    
    let result = 0;

    for(let i = 0; i< longs.length; i++) {
        let longOpenValue = (longs[i].qty) * longs[i].open;
        let longCurrentValue = (longs[i].qty) * currentPrice;
        result += longCurrentValue - longOpenValue;
    }

    for(let i = 0; i< shorts.length; i++) {
        let shortOpenValue = (shorts[i].qty) * shorts[i].open;
        let shortCurrentValue = (shorts[i].qty) * currentPrice;
        result += shortOpenValue - shortCurrentValue;
    }

    return result;

}

let stop = 0;
let maxMartinGaleCnt = 0;
let worstPNL = 0;
let nbClose = 0;
let startTime = null;
let totalOrderCount = 0;

const start = async () => {
    
    let dummyService = new DummyService(CONFIG.symbol);
    dummyService.listen((e) => {
        if (stop > 0) {
            return;
        }
        let markPrice = parseFloat(e.markPrice);
        let currentTime = new Date(e.time);
        if(!startTime) {
            startTime = currentTime;
        }
        
        logPrice(markPrice);

        // open first martingale
        if(longs.length == 0 && shorts.length == 0) {
            openFirst(markPrice, currentTime);
        }
        // check trade value
        const myPNL = PNL(markPrice);
        if(myPNL < worstPNL) {
            worstPNL = myPNL;
        }
        if(myPNL >= nextMartingaleUsdt * positionQty) {
            nbClose++;
            if(shorts.length + longs.length > maxMartinGaleCnt) {
                maxMartinGaleCnt = shorts.length + longs.length;
            }
            balance += tradeValue(markPrice);
            console.log("========================================");
            console.log("==== close positions PNL = " + myPNL);
            console.log("==== TIME = " + e.time);
            logAll(markPrice, currentTime);
            longs = new Array();
            shorts = new Array();
            console.log("========================================");
            console.log("==== OPEN FIRST = ");
            openFirst(markPrice, currentTime);
            return;
        }
        
        if(markPrice >= getNextLongPrice()) {
            openLong(markPrice, positionQty);
            // logAll(markPrice, "long");
            return;
        }
        

        if(markPrice <= getNextShortPrice()) {
            openShort(markPrice, positionQty);
            // logAll(markPrice, "short");
            return;
        }
    });


}

const openFirst = (markPrice, currentTime) => {
    nextMartingaleUsdt = markPrice * nextMartingalePercent;
    positionQty = parseFloat(positionAmount / markPrice).toFixed(3);
    openLong(markPrice, positionQty);
    logAll(markPrice, currentTime);
    return;
}

const logAll = (markPrice, currentTime) => {
    console.log("========================================");
    console.log("==== balance = " + balance);
    console.log("==== pnl = " + PNL(markPrice));
    console.log("==== target pnl; " + nextMartingaleUsdt * positionQty);
    console.log("==== trade value = " + tradeValue(markPrice));
    console.log("==== maxMartinGaleCnt = " + maxMartinGaleCnt);
    console.log("==== worstPNL = " + worstPNL);
    console.log("==== totalOrderCount = " + totalOrderCount);
    console.log("==== nbClose = " + nbClose);
    console.log("==== time elapsed = " + getDiffDateInHours(currentTime, startTime) + ' hours');
}

const getDiffDateInHours = (date1, date2) => {
    var diff = Math.abs(date1.getTime() - date2.getTime()) / 3600000
    return diff;
}


const getNextLongPrice = () => {

    const maxLong = longs.length == 0 ? -1 : Math.max(...longs.map(l => l.open));
    const maxShort = shorts.length == 0 ? -1 : Math.max(...shorts.map(s => s.open));
    const refPriceLong = maxLong == -1 ? maxShort : maxLong;

    return refPriceLong + nextMartingaleUsdt;

}

const getNextShortPrice = () => {

    const minLong = longs.length == 0 ? -1 : Math.min(...longs.map(l => l.open));
    const minShort = shorts.length == 0 ? -1 : Math.min(...shorts.map(s => s.open));
    const refPriceShort = minShort == -1 ? minLong : minShort;
    
    return refPriceShort - nextMartingaleUsdt;

}

start();

