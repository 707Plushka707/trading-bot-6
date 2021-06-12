const fs = require('fs');
const EventEmmiter = require('events');

const folderPath = `D:/trading data/output`;

const TRANSACTION_FEE = 0.0004;

class DummyService extends EventEmmiter {

    #currentPrice;

    //--------------

    #symbol;
    #balance;

    #longs = new Array();
    #shorts = new Array();


    //--------------

    constructor(params) {
        super();
        this.#symbol = params.symbol;
        this.#balance = params.balance ? params.balance : 10000;
    }

    listen = (callback, startTime) => {
        const fileList = fs.readdirSync(folderPath);
        for(let i = 0; i<fileList.length; i++) {

            const file = fileList[i];
            const subNames = file.replace('.txt', '').split('_');
            if(subNames[1] != this.#symbol) {
                continue;
            }
    
            const startTimeRead = new Date(...subNames[2].split('-'));
            if(startTime) {
                if(startTime > startTimeRead) {
                    continue;
                }
            }

            const data = fs.readFileSync(folderPath + '/' + file,{encoding:'utf8', flag:'r'});
            const lines = data.split('\n');
            for(let j = 0; j<lines.length; j++) {
                if(lines[j].trim() == '') {
                    continue;
                }
                const pricedetail = JSON.parse(lines[j]);
                this.#currentPrice = pricedetail.markPrice;
                callback(pricedetail);
            }
        }
    }

    open = (side, quantity) => {
        
        this.#balance -= this.#currentPrice * quantity;

        if(this.#balance < 0) {
            throw Error('Not enought funds : #balance = ' + this.#balance + ', quantity = ' + quantity);
        }

        if(side.toUpperCase() == 'LONG') {
            this.#longs.push({
                open:this.#currentPrice,
                quantity
            });

            return this.#longs[this.#longs.length];
        } else {
            this.#shorts.push({
                open:this.#currentPrice,
                quantity
            });

            return this.#shorts[this.#shorts.length];
        }
    }

    closeAll = () => {
        this.#balance += this.getTradeValue();
        this.#longs = new Array();
        this.#shorts = new Array();
    }

    getBalance = () => {
        return this.#balance;
    }


    //--------------

    getTradeValue = () => {
        
        let tradeValue = 0;

        for(let i = 0; i< this.#longs.length; i++) {
            let longOpenValue = (this.#longs[i].quantity) * this.#currentPrice;
            tradeValue += longOpenValue;
        }

        for(let i = 0; i< this.#shorts.length; i++) {
            let shortOpenValue = (this.#shorts[i].quantity) * this.#shorts[i].open;
            let shortCurrentValue = (this.#shorts[i].quantity) * this.#currentPrice;
            tradeValue += shortOpenValue + shortOpenValue - shortCurrentValue;
        }

        return tradeValue;

    }

    getPNL = () => {
        
        let result = 0;
        for(let i = 0; i< this.#longs.length; i++) {
            let longOpenValue = (this.#longs[i].quantity) * this.#longs[i].open;
            let longCurrentValue = (this.#longs[i].quantity) * this.#currentPrice;
            result += longCurrentValue - longOpenValue;
        }

        for(let i = 0; i< this.#shorts.length; i++) {
            let shortOpenValue = (this.#shorts[i].quantity) * this.#shorts[i].open;
            let shortCurrentValue = (this.#shorts[i].quantity) * this.#currentPrice;
            result += shortOpenValue - shortCurrentValue;
        }

        return result;

    }

}

module.exports = DummyService