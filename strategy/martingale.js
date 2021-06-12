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
    firstPostionTime;

    worstPNL = 0;
    closeCount = 0;
    maxMartigaleCount = 0;
    maxMinutes = 0;

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
                this.openFirst(markPrice, currentTime);
            }

            // check trade value
            const myPNL = this.binanceService.getPNL();
            if(myPNL < this.worstPNL) {
                this.worstPNL = myPNL;
            }

            if(myPNL >= this.targetPriceDistance * this.positionQuantity) {

                this.saveStats(this.firstPostionTime);

                this.binanceService.closeAll();
                this.logClose(myPNL, currentTime);

                this.openFirst(markPrice, currentTime);
                return;
            }
            
            if(markPrice >= this.getNextLongPrice()) {
                this.openLong(markPrice);
                return;
            }
            
            if(markPrice <= this.getNextShortPrice()) {
                this.openShort(markPrice);
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
        let minutes = this.getDiffDateInMinutes(currentTime, this.firstPostionTime)
        if(minutes > this.maxMinutes) {
            this.maxMinutes = minutes;
        }
    }

    getDiffDateInMinutes = (date1, date2) => {
        var diff = Math.abs(date1.getTime() - date2.getTime()) / 3600000 * 60
        return diff;
    }

    logClose = (pnlDone, currentTime) => {
        console.log("==== CLOSE ALL ====");
        console.log("= pnlDone : " + pnlDone);
        console.log("= balance : " + this.binanceService.getBalance());
        console.log("= time elapled = " + this.getDiffDateInMinutes(currentTime, this.startTime));
        console.log("= worstPNL : " + this.worstPNL);
        console.log("= closeCount : " + this.closeCount);
        console.log("= maxMartigaleCount : " + this.maxMartigaleCount);
        console.log("= maxMinutes = " + this.maxMinutes);
    }

    openFirst = (markPrice, currentTime) => {
        this.targetPriceDistance = markPrice * this.targetPercent;
        this.positionQuantity = parseFloat(this.positionAmount / markPrice).toFixed(3);
        this.firstPostionTime = currentTime;
        this.openLong(markPrice);
    }

    openLong = (markPrice) => {
        console.log("OPEN LONG : " + markPrice);
        this.longs.push(this.binanceService.open('long', this.positionQuantity));
    }

    openShort = (markPrice) => {
        console.log("OPEN SHORT : " + markPrice);
        this.shorts.push(this.binanceService.open('short', this.positionQuantity));
    }

    getNextLongPrice = () => {
        const maxLong = this.longs.length == 0 ? this.shorts[this.shorts.length - 1].open : this.longs[this.longs.length - 1].open;
        return maxLong + this.targetPriceDistance;
    }
    
    getNextShortPrice = () => {
        const minShort = this.shorts.length == 0 ? this.longs[this.longs.length - 1].open : this.shorts[this.shorts.length - 1].open;
        return minShort - this.targetPriceDistance;
    }
} 

module.exports = MartingaleStrategy