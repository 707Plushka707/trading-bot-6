const Binance = require('node-binance-api');
const EventEmmiter = require('events');

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET,
    hedgeMode: true,
    test: process.env.TEST_MODE == 1 ? true : false
});

class BinanceService extends EventEmmiter {

    #symbol;

    constructor(symbol) {
        super();
        this.#symbol = symbol;
    }


    listen(websocketname, callback) {
        return binance.futuresSubscribe(this.#symbol + '@' + websocketname, callback);
    }

    

    // async checkOrders() {
    //     //const res = await binance.futuresTrades("SRMUSDT");
    //     //const res = await binance.futuresUserTrades("SRMUSDT" );
    //     //const res = await binance.futuresMarketBuy('SRMUSDT', 1)
    //     //const res = await binance.futuresOpenOrders("SRMUSDT");
    //     //const res = await binance.futuresOrderStatus('SRMUSDT', {origClientOrderId:4750394025})
    //     //const res = await binance.futuresMarketBuy('SRMUSDT', 1)


    //     // const res = await binance.futuresPositionRisk( { symbol: "LITUSDT" } );
    //     // res.filter(r => r.symbol == "LITUSDT")[0]

    //     // const res = await binance.futuresOpenOrders("LITUSDT");
    //     // res.filter(r => r.symbol == "LITUSDT")[0]

    //     // const res = await binance.futuresAllOrders("TOMOUSDT");
    //     // res.forEach(o => {
    //     //     const a = new Date(o.time);
    //     //     console.log(o.time);
    //     //     console.log(a);
    //     // });

    //     // let buy = await binance.futuresMarketBuy("TOMOUSDT", 7);
    //     // console.log(buy);
    //     // console.log("--------------------");
    //     // let o = await binance.futuresOrderStatus("TOMOUSDT", { orderId: buy.orderId } )
    //     // // console.log(o.filter(x => x.orderId == buy.orderId));
    //     // console.log(o);

        
    //     let sell = await binance.futuresMarketSell("TOMOUSDT", 1, { positionSide: "LONG" });
    //     console.log(sell);

        
    //     // let o = await binance.futuresAllOrders()

    //     // console.log(o)

    // }
}

module.exports = BinanceService