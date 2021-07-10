const Binance = require('node-binance-api');
const EventEmmiter = require('events');

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET,
    hedgeMode: true,
    test: process.env.TEST_MODE == 1 ? true : false
});

class BinanceService extends EventEmmiter {

    #params;
    #symbol;

    #pricePrecision; // number of digit
    #lotSize; // min qty

    constructor(params) {
        super();
        this.#symbol = params.symbol;
        this.#params = params;

    }

    convertToMarkPrice = (data) => {
        const m = {};
            m.time= new Date(data.E)
            m.symbol= data.s
            m.markPrice= data.p
            m.indexPrice= data.i
            m.settlePrice= data.P
            m.fundingRate= data.r
            m.nextFundingTime= new Date(data.T)
        
        return m;
    }


    listen2(websocketname, callback) {
        return binance.futuresSubscribe(this.#symbol + '@' + websocketname, callback);
    }

    listen = (callback) => {
        
        const websocketname = this.#symbol.toLowerCase() + '@markPrice@1s';

        const websocket = binance.futuresSubscribe(websocketname, (e) => {
            const data = this.convertToMarkPrice(e);

            let log = data.time + ' - ';
            log += 'price : ' + data.markPrice + ' - ';
            // log += 'pnl : ' + this.getPNL() + ' - ';

            console.log(log);

            if(callback) {
                callback(data);
            }
        });

        return websocket;
    }

    //---------------------------------
    //------- Initialization ----------
    //---------------------------------

    init = async () => {
        
        await this.initHedgeMode();
        await this.initLeverage();
        await this.initMarginType();
        await this.initMarketData();

    }

    initMarketData = async () => {

        const result = await binance.futuresExchangeInfo();
        const data = result.symbols.filter(s => s.symbol == "AXSUSDT")[0];

        this.#pricePrecision = data.pricePrecision;
        this.#lotSize = data.filters.filter(f => f.filterType == "MARKET_LOT_SIZE")[0].stepSize;

    }

    initMarginType = async () => {

        let result = await binance.futuresPositionRisk({symbol:this.#symbol});
        if(result.code) {
            throw new Error(`Can not get margin type : ${JSON.stringify(result)}`);
        }

        if(result[0].marginType.toUpperCase() != "CROSS") {
            console.log("Need to set margin type to crossed");

            result = await binance.futuresMarginType(this.#symbol, "CROSSED");
            if(result.code != 200) {
                throw Error(`Could not initialize margin type : ${JSON.stringify(result)}`);
            }
        }

        console.log(`Margin type initialiazed successfully`);
    }

    initLeverage = async () => {
        const result = await binance.futuresLeverage(this.#symbol, this.#params.leverage);
        if(result.code) {
            throw new Error(`Can not set leverage to ${this.#params.leverage} : ${JSON.stringify(result)}`);
        }

        console.log(`Leverage initialiazed successfully : ${JSON.stringify(result)}`);
    }

    initHedgeMode = async () => {

        let result;
        
        result = await binance.futuresPositionSideDual();

        if(!result.dualSidePosition) {
            console.log("Need to set hedge mode on");

            result = await binance.futuresChangePositionSideDual(true);
            if(result.code != 200) {
                throw Error(`Could not initialize hedge mode (setting hedge position) : ${JSON.stringify(result)}`);
            }
        }
        
        console.log(`Hedge mode initialized successfully : ${JSON.stringify(result)}`);
    }


    //------------------------
    //------- Account---------
    //------------------------

    getBalance = async () => {
        const result = await binance.futuresBalance();
        return result.filter(i => i.asset == "USDT")[0].availableBalance;
    }

    getLeverage = async () => {
        return new Promise((resolve, reject) => { resolve(this.#params.leverage) });
    }

    getPNL = async () => {
        const result = await binance.futuresBalance();
        return result.filter(i => i.asset == "USDT")[0].crossUnPnl;
    }


    //------------------------
    //------- Order ----------
    //------------------------
    
    open = async (side, quantity, price) => {
        if(side.toUpperCase() == 'LONG') {
            let res = await binance.futuresMarketBuy(this.#symbol.toLowerCase(), quantity);
            return  {
                open:price,
                quantity
            }
        } else if(side.toUpperCase() == 'SHORT') {
            let res = await binance.futuresMarketSell(this.#symbol.toLowerCase(), quantity);
            return  {
                open:price,
                quantity
            }
        }
    }

    closeAll = async () => {
        const positions = await binance.futuresPositionRisk({symbol:this.#symbol});

        // get position amount
        const longPositionAmount = positions.filter(p => p.positionSide.toUpperCase() == "LONG")[0].positionAmt;
        const shortPositionAmount = positions.filter(p => p.positionSide.toUpperCase() == "SHORT")[0].positionAmt;

        // close long
        await binance.futuresMarketSell(this.#symbol, longPositionAmount, { positionSide: "LONG" });

        // close short
        await binance.futuresMarketBuy(this.#symbol, 2, { positionSide: "SHORT" });
    }
}

module.exports = BinanceService