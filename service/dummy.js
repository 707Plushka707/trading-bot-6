const fs = require('fs');
const EventEmmiter = require('events');

const folderPath = `D:/trading data/output`;

class DummyService extends EventEmmiter {

    #symbol;

    constructor(symbol) {
        super();
        this.#symbol = symbol;
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
                callback(JSON.parse(lines[j]));
            }
        }
    }
}

module.exports = DummyService