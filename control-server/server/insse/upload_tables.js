// upload csv to database: $ node upload_tables.js
// upload INSSE Tempo data to PostgreSQL DB


// import libraries
const fs = require('fs');
const axios = require('axios');
// const logger = require('../../node_modules/morgan/index');
const cheerio = require('cheerio');
// library to format time
const dateFormat = require('dateformat');
const glob = require('glob');
const readline = require('readline');


// paths
const inputPath = '../../../docker-data/control/insse';
// const jsonOutputPath = '../../../docker-data/control/insse/json';
const csvOutputPath = '../../../docker-data/control/insse/csv/';
const csvTransformPath = '../../../docker-data/control/insse/extracts/csv-transform/';
const extractsOutputPath = '../../../docker-data/control/insse/extracts/';
// const tempoL1File = `${inputPath}/tempoL1.json`;
// const tempoL2File = `${inputPath}/tempoL2.json`;
const tempoL3File = `${inputPath}/tempoL3.json`;
// const requestPath = 'http://statistici.insse.ro:8077/tempo-ins/matrix/';
// const tempoL3 = { level3: [] };
// const stringifier = csv.stringify();
// INSSE Tempo query limit (no of cells)
// const queryLimit = 30000;


// ////////////////////////////////////////////////////////////////////////////////////////////
// // METHODS

// ////////////////////////////////////////////////////////////////////////////////////////////
// load table headers from file [tempoL3.json]
function readFile(filePath) {
    // console.log(`@read file: ${filePath}`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    console.log('@readTemplate: File not found!');
    return {};
}

// ///////////////////////////////////////////////////////////////////////////////////////
// // download DataBase data from INSSE

function extractCounties() {
    // set extracts
    const exTable = [
        { name: 'Suceava', code: 'SV' },
        { name: 'Salaj', code: 'SJ' },
        { name: 'Tulcea', code: 'TL' },
    ];

    // start timer
    const dbStartTime = new Date();
    const dbStartDate = dateFormat(dbStartTime, 'isoDate');
    console.log('\x1b[33m%s\x1b[0m', '@extractCounties:: Timer started\n');

    // read table ancestors from file
    // const tempoL1 = readFile(tempoL1File);
    // const ancestors = tempoL1.level1;
    const tempoL3 = readFile(tempoL3File);
    // filter the tables containing localities data ( 86 tables )
    const childrenArr = tempoL3.level3.filter(item => item.matrixName.includes('si localitati'));
    console.log(`\nTOTAL COUNT = ${childrenArr.length}\n`);

    // save list to file
    const indexListStream = fs.createWriteStream(`${extractsOutputPath}/index_list.csv`);
    indexListStream.write('"indicator";"nume"\n');

    // for each table, filter the given county
    childrenArr.forEach((child, index) => {
        const tableName = child.tableName;
        // save item to index file
        const writeLine = `"${tableName}";"${child.matrixName}"\n`;
        indexListStream.write(writeLine);
        indexListStream.on('error', (err) => {console.log(err);});

        // console.log(child);
        // const tableIndex = ancestors.filter(item => item.context.code === tableCode)[0].context.name.split(' ')[0].replace('.', '');
        // const ancestorPrefix = ancestors.filter(item => item.context.code === parentCode)[0].context.name.split(' ')[0];
        // const tablePrefix = `${ancestorPrefix}.${tableIndex}`;
        const fileName = `????-??-??_*_${tableName}.csv`;
        // test if file exists
        if (glob.sync(fileName, { cwd: csvOutputPath }).length > 0) {
            console.log(`file ${index} found`);

            // get actual filename
            const currentFileName = glob.sync(fileName, { cwd: csvOutputPath })[0];
            const currentFilePath = csvOutputPath + currentFileName;
            console.log(`${index} :: ${currentFileName}: START`);

            // create new files to hold the filtered values
            const streams = [];
            exTable.forEach((sItem) => {
                streams.push(fs.createWriteStream(`${extractsOutputPath}/${sItem.code}/${currentFileName}`));
            });

            // parse file, line by line
            const rl = readline.createInterface({
                input: fs.createReadStream(currentFilePath),
                // output: process.stdout,
            });

            // set line counter
            let lineCounter = 0;

            // parse each line
            rl.on('line', (line) => {
                lineCounter += 1;
                if (lineCounter === 1) {
                    const newLine = line.replace(/;(Localitati)\s*;/gm, ';SIRUTA;$1;');
                    streams.forEach(stream => stream.write(`${newLine}\n`));
                    // print new header to console
                    console.log(`\n${index} :: ${currentFileName}: HEADER`);
                    console.log(newLine);
                } else {
                    streams.forEach((stream, itemIndex) => {
                        if (line.includes(exTable[itemIndex].name)) {
                            // console.log(`\n${line}`);
                            const newLine = line.replace(/;"(\d+)\s([^"]+)";/gm, ';"$1";"$2";');
                            if(line !== newLine) stream.write(`${newLine}\n`);
                        }
                    })
                }
                
            });
            rl.on('close', (line) => {
                // console.log(line);
                console.log(`${index} :: ${currentFileName}: done reading file.`);
                streams.forEach(stream => stream.close());
            });
        }
    
    // close index file
    // indexListStream.close();
    });

    // upload tables to database

    
    // end timer
    const dbDuration = new Date() - dbStartTime;
    console.info('\x1b[33m%s\x1b[0m', `\nProcess execution time: ${Math.floor(dbDuration / 1000)}s`);
}


// ///////////////////////////////////////////////////////////////////////////////////////
// get array of time instances from table files

function getTimesArr(index, currentFileName, filePath) {
    return new Promise((resolve) => {
    // open file for first stage processing
    const inStream = readline.createInterface({
        input: fs.createReadStream(filePath),
        // output: process.stdout,
    });

    // create time array
    const timesArr = [];

    // set markers
    let lineCounter = 0;
    let perioadeIndex = -1;
    let aniIndex = -1;
    let umIndex = -1;
    let valoareIndex = -1;

    // parse each line
    inStream.on('line', (line) => {
        lineCounter += 1;

        // break line into array
        const lineArr = line.replace('"', '').replace('\n', '').split(';');

        // header item
        if (lineCounter === 1) {
            // console.log(lineArr);
            perioadeIndex = lineArr.indexOf('Perioade');
            aniIndex = lineArr.indexOf('Ani');
            umIndex = aniIndex + 1;
            valoareIndex = umIndex + 1;
        // lines
        } else {
            let timeInstance = '';
            // verify if 'Perioade' column is present
            // if time is represented only in 'Ani'
            if (perioadeIndex === -1) {
               timeInstance = `"${lineArr[aniIndex]}"`;
            // if time is represented in 'Perioade' and 'Ani'
            } else {
                timeInstance = `"${lineArr[perioadeIndex]} + ' ' + ${lineArr[aniIndex]}"`;
            }
            // if item is new add it into timesArr
            if (!timesArr.includes(timeInstance)) timesArr.push(timeInstance);
        }
        
    });
    inStream.on('error', (err) => {
        console.log(err);
    });
    // inStream.on('close', (line) => {
    //     // console.log(line);
    //     console.log(`${index} :: ${currentFileName}: time array finished!`);
    //     return {
    //         timesArr,
    //         lineCounter,
    //         perioadeIndex,
    //         aniIndex,
    //         umIndex,
    //         valoareIndex,
    //     };
    // });
    inStream.on('close', resolve({
                timesArr,
                lineCounter,
                perioadeIndex,
                aniIndex,
                umIndex,
                valoareIndex,
            }));
});
}


// ///////////////////////////////////////////////////////////////////////////////////////
// // transform tables - get all time instances into columns

function transformTables() {

    // start timer
    const dbStartTime = new Date();
    const dbStartDate = dateFormat(dbStartTime, 'isoDate');
    console.log('\x1b[33m%s\x1b[0m', '@transformTables:: Timer started\n');
    
    let selectedTArr = [];

    // read selected tables ids from file
    try {
        const selectedTables = fs.readFileSync(`${extractsOutputPath}/index_list.csv`, 'utf8').split('\n');
        // remove last item (empty item generated from split)
        selectedTables.pop();
        selectedTArr = selectedTables.map(line => line.split(';')[0].replace(/"/g, '')).slice(1);
        console.log(`@transformTables :: table IDs are ready for ${selectedTArr.length} tables\n`);

    } catch(e) {
        console.log('Error: ', e.stack);
    }
    
    // for each table id get header data
    selectedTArr.map(async (tableId, index) => {

        const returnObj = {};
        returnObj.tableId = tableId;
        returnObj.index = index;

        const fileName = `????-??-??_*_${tableId}.csv`;
        // test if file exists
        if (glob.sync(fileName, { cwd: csvOutputPath }).length > 0) {
            console.log(`file ${index} found`);

            // get actual filename
            const currentFileName = glob.sync(fileName, { cwd: csvOutputPath })[0];
            const currentFilePath = csvOutputPath + currentFileName;
            console.log(`${index} :: ${currentFileName}: START`);

            // first stage processing
            // create array of time instances
            const headerInfo = await getTimesArr(index, currentFileName, currentFilePath);
            console.log(`${index} :: outside header`);

            // pass data into return object
            returnObj.fileName = currentFileName;
            returnObj.filePath = currentFilePath;
            returnObj.timesArr = await headerInfo.timesArr;
            returnObj.lineCounter = headerInfo.lineCounter;
            returnObj.perioadeIndex = headerInfo.perioadeIndex;
            returnObj.aniIndex = headerInfo.aniIndex;
            returnObj.umIndex = headerInfo.umIndex;
            returnObj.valoareIndex = headerInfo.valoareIndex;

            console.log(`${index} :: ${currentFileName} : headerInfo aquired`);
            console.log(`${index} :: ${returnObj.timesArr}`);

        } else {
            console.log(`\n${fileName} NOT FOUND!\n`);
        }

        // return new values
        return returnObj;
    });
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN FUNCTION

function main() {

    // help text
    const helpText = '\n Available commands:\n\n\
 1. -h or --help : display help text\n\
 2. -e or --extract : extract desired counties (SJ, SV, TL) in separate folders and files (folders must be created manually)\n\
 3. -t or --transform : refactor tables to display data in one line, each time instance becomes a header column\n\
    (destination folder must be created manually)\n\n\
    ';

    // get third command line argument
    const argument = process.argv[2] || '--help';
    console.log('\x1b[34m%s\x1b[0m', `\n@uploadTables >>>>>>> ${argument}`);

    // run requested command
    // 1. if argument is 'h' or 'help' print available commands
    if (argument === '-h' || argument === '--help') {
        console.log(helpText);

    // 2. else if argument is 'e' or 'extract', check which tables have 'luni' for time column
    } else if (argument === '-e' || argument === '--extract') {
        // read table headers from file
        extractCounties();

    // 3. refactor tables: create columns from time instances
    } else if (argument === '-t' || argument === '--transform') {
        // read table headers from file
        transformTables();

    // else print help
    } else {
        console.log(helpText);
    }

}


// ////////////////////////////////////////////////////////////////////////////
// // RUN MAIN

main();
