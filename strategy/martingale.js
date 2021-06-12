const DummyService = require('../service/dummy.js');

class MartingaleStrategy {
    
    binanceService;

    totalTrades;

    positionPercent;
    positionAmount;
    positionQuantity
    
    targetPercent;
    targetPriceDistance;

    symbol;

    longs = new Array();
    shorts = new Array();

    startTime;

    worstPNL;
    closeCount = 0;
    maxMartigaleCount = 0;
    maxHours = 0;

    //----------------
    
    constructor(params) {
        this.symbol = params.symbol;
        this.positionPercent = params.positionPercent ? params.positionPercent : 0.01;
        this.targetPercent = params.targetPercent ? params.targetPercent : 0.005;
        
        this.binanceService = new DummyService({symbol:this.symbol});
        
        const balance = this.binanceService.getBalance();
        this.positionAmount = balance * this.positionPercent;
    }
    
    //----------------


    start = () => {
        let line = 0;
        this.binanceService.listen((e) => {
            let markPrice = parseFloat(e.markPrice);
            let currentTime = new Date(e.time);
            if(!this.startTime) {
                this.startTime = currentTime;
            }

            // open first martingale
            if(this.longs.length == 0 && this.shorts.length == 0) {
                this.openFirst(markPrice);
            }

            // check trade value
            const myPNL = this.binanceService.getPNL();
            if(myPNL < this.worstPNL) {
                this.worstPNL = myPNL;
            }

            if(myPNL >= this.targetPriceDistance * this.positionQuantity) {

                this.saveStats(currentTime);

                this.binanceService.closeAll();
                // this.logClose(currentTime);

                this.openFirst(markPrice);
                return;
            }
            
            if(markPrice >= this.getNextLongPrice()) {
                this.open('long', this.positionQuantity);
                return;
            }
            

            if(markPrice <= this.getNextShortPrice()) {
                this.open('short', this.positionQuantity);
                return;
            }
        });

    }


    //----------------

    saveStats = (currentTime) => {
        this.closeCount++;
        if(this.shorts.length + this.longs.length > this.maxMartigaleCount) {
            this.maxMartigaleCount = this.shorts.length + this.longs.length;
        }
        let hours = this.getDiffDateInHours(currentTime, this.startTime)
        if(hours > this.maxHours) {
            this.maxHours = hours;
        }
    }

    getDiffDateInHours = (date1, date2) => {
        var diff = Math.abs(date1.getTime() - date2.getTime()) / 3600000
        return diff;
    }

    logClose = () => {
        console.log("==== CLOSE ALL ====");
        console.log("= balance : " + this.binanceService.getBalance());
        console.log("= worstPNL : " + this.worstPNL);
        console.log("= closeCount : " + this.closeCount);
        console.log("= maxMartigaleCount : " + this.maxMartigaleCount);
        console.log("= maxHours = " + this.maxHours);
    }

    openFirst = (markPrice) => {
        this.targetPriceDistance = markPrice * this.targetPercent;
        this.positionQuantity = parseFloat(this.positionAmount / markPrice).toFixed(3);
        this.openLong();
    }

    openLong = () => {
        this.longs.push(this.binanceService.open('long', this.positionQuantity));
    }

    openShort = () => {
        this.short.push(this.binanceService.open('short', this.positionQuantity));
    }

    getNextLongPrice = () => {
        const maxLong = this.longs.length == 0 ? this.shorts[this.shorts.length] : this.longs[this.longs.length] ;
        return maxLong + this.targetPriceDistance;
    }
    
    getNextShortPrice = () => {
        const minShort = this.shorts.length ? this.longs[this.longs.length] : this.shorts[this.shorts.length] ;
        return minShort - this.targetPriceDistance;
    }
} 

module.exports = MartingaleStrategy