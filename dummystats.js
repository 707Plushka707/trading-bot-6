const fs = require('fs');

const folderPath = 'D:/trading data/output4';

const getSymbols = () => {
    
    const fileList = fs.readdirSync(folderPath);
    let symbolList = new Array();

    for(let i = 0; i<fileList.length; i++) {
        const file = fileList[i];
        const subNames = file.replace('.txt', '').split('_');
        if(symbolList.indexOf(subNames[1]) == -1) {
            symbolList.push(subNames[1]);
        }
    }

    return symbolList;
}


module.exports = {
    getSymbols
}
