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

function uploadCSV() {
    // set extracts
    const exTable = [
        { name: 'Suceava', code: 'SV' },
        { name: 'Salaj', code: 'SJ' },
        { name: 'Tulcea', code: 'TL' },
    ];

    // start timer
    const dbStartTime = new Date();
    const dbStartDate = dateFormat(dbStartTime, 'isoDate');
    console.log('\x1b[33m%s\x1b[0m', '@downloadDB:: Timer started\n');

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


// ////////////////////////////////////////////////////////////////////////////
// // MAIN

uploadCSV();
