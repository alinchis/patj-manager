// static load: $ node fetch_functions.js
// get INSSE Tempo data


// import libraries
const fs = require('fs');
// const csv = require('csv');
// const assert = require('assert');
// import readline from 'readline';
// import path from 'path';
// import sequelize from 'sequelize';
// import http from 'http';
const axios = require('axios');
// const logger = require('../../node_modules/morgan/index');
const cheerio = require('cheerio');
// library to format time
const dateFormat = require('dateformat');

// paths
const inputPath = '../../../docker-data/control/insse';
const jsonOutputPath = '../../../docker-data/control/insse/json';
const csvOutputPath = '../../../docker-data/control/insse/csv';
const tempoL1File = `${inputPath}/tempoL1.json`;
const tempoL3File = `${inputPath}/tempoL3.json`;
const requestPath = 'http://statistici.insse.ro:8077/tempo-ins/matrix/';
// const tempoL3 = { level3: [] };
// const stringifier = csv.stringify();
// INSSE Tempo query limit (no of cells)
const queryLimit = 30000;


// /////////////////////////////////////////////////////////////////////////////
// // METHODS


// load table headers from file [tempoL3.json]
function readFile(filePath) {
  // console.log(`@read file: ${filePath}`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  console.log('@readTemplate: File not found!');
  return {};
}


// for item in list and given array of columns, create POST body
function createPostBody(item, arr) {
  const postBody = {};
  postBody.language = 'ro';
  postBody.arr = arr;
  postBody.matrixName = item.matrixName;
  postBody.matrixDetails = item.details;

  return postBody;
}


// create array for culumn given
function groupColumnItems(column, parentId, limit) {
  // create a work array
  let workColumn = column;
  let newLimit = 0;
  let newParentId = parentId;
  // console.log('@group::workColumn: ', workColumn);
  console.log('\x1b[34m%s\x1b[0m', '\n@groupColumnItems >>>>>>>');
  console.log('@group::limit: ', limit);
  console.log('@group::parentId: ', parentId);
  // initialize the return array
  const returnArr = {
    type: 'regular',
    values: [],
  };
  // check if current column has dependency / is Chlidren column
  const dependency = workColumn[0].parentId !== null;
  // check if current column is parent
  const parenthood = workColumn.filter(item => item.nomItemId === parentId).length > 0;

  if (dependency) {
    console.log('\x1b[36m%s\x1b[0m', '@group:: children branch');
    // check and remove the first element if is 'Total'
    if (workColumn[0].parentId === workColumn[0].nomItemId) workColumn.shift();
    // set parentId as the parentId of the first element in array
    newParentId = workColumn[0].parentId;
    // create array of Children by grouping items with same parrent
    while (workColumn.length > 0) {
      const searchId = workColumn[0].parentId;
      returnArr.type = 'child';
      returnArr.values.push(workColumn.filter(item => item.parentId === searchId));
      workColumn = workColumn.filter(item => item.parentId !== searchId);
    }

    const lenghtsArr = returnArr.values.map(item => item.length);
    newLimit = Math.floor(limit / Math.max(...lenghtsArr));

  } else if (parenthood) {
    console.log('\x1b[36m%s\x1b[0m', '@group:: parent branch');
    returnArr.type = 'parent';
    // remove 'total' cell
    if (workColumn[0].label.toLowerCase().trim() === 'total') workColumn.shift();
    // return items
    returnArr.values = workColumn.map(item => [item]);
    // one item array does not influence the limit, return same limit
    newLimit = limit;
    // reset parentId value
    newParentId = null;
  } else if (limit === 0) {
    console.log('\x1b[36m%s\x1b[0m', '@group:: limit === 0 branch');
    returnArr.values = workColumn.map(item => [item]);
    // console.log(returnArr.values);
  } else if (limit > column.length) {
    console.log('\x1b[36m%s\x1b[0m', '@group:: limit > column.lenght branch');
    // a column selection can hold max 500 items
    if (column.length > 500) {
      for (let i = 0, j = workColumn.length; i < j; i += 500) {
        returnArr.values.push(workColumn.splice(0, 500));
      }
      newLimit = Math.floor(limit / 500);
    } else {
      returnArr.values = [workColumn];
      newLimit = Math.floor(limit / column.length);
    }
  } else if (limit < column.length) {
    console.log('\x1b[36m%s\x1b[0m', '@group:: limit < column.length branch');
    // a column selection can hold max 500 items
    if (limit > 500) {
      for (let i = 0, j = workColumn.length; i < j; i += 500) {
        returnArr.values.push(workColumn.splice(0, 500));
      }
      newLimit = 0;
    } else {
      for (let i = 0, j = workColumn.length; i < j; i += limit) {
        returnArr.values.push(workColumn.splice(0, limit));
      }
      newLimit = 0;
    }
  }

  console.log('@group:: return values !!! ');
  // console.log(returnArr.values);

  // return the array with grouped values
  return { returnArr, newParentId, newLimit };
}


// build permutations
function buildPermutations(columns, limit) {
  console.log('\x1b[34m%s\x1b[0m', '\n@buildPermutations >>>>>>>');

  let workLimit = limit;
  let permutations = [];
  let parentId = null;

  // iterate over array of columns and build the permutations
  columns.reverse().forEach((column, index) => {
    // for each column return items grouped
    const newColumns = groupColumnItems(column, parentId, workLimit);
    const newPermutations = [];
    // update parentId and Limit
    parentId = newColumns.newParentId;
    workLimit = newColumns.newLimit;
    // create permutation array
    if (index === 0) {
      console.log('\n@build:: first column branch');
      newPermutations.push(newColumns.returnArr.values);
    } else if (newColumns.returnArr.type === 'parent') {
      console.log('\n@build:: parent branch');
      // console.log(permutations[permutations.length - 1]);
      newColumns.returnArr.values.forEach((parent) => {
        // console.log(parent[0].nomItemId);
        const children = permutations[permutations.length - 1].filter(child => child[0].parentId === parent[0].nomItemId);
        // console.log(children);
        newPermutations.push([parent, ...children]);
      });
    } else {
      console.log('\n@build:: else branch');
      // console.log(newColumns.returnArr.values);
      newColumns.returnArr.values.forEach((item) => {
        permutations.forEach((elem) => {
          newPermutations.push([item, ...elem]);
        });
      });
    }
    permutations = newPermutations;
    console.log(`@build ${index}::permutations >>>`);
    // console.log(permutations[0]);
  });

  // return permutations array
  return permutations;
}


// query function
function getData(tablePrefix, tableName, progressIndex, arr, permList) {
  const reqPath = requestPath + tableName;
  console.log('\x1b[34m%s\x1b[0m', `${tablePrefix} ${tableName} - ${progressIndex}  @getData >>>>>>>`);

  // console.log('@getData::request path: ', reqPath);
  const postBody = createPostBody(arr, permList);
  // console.log('@getData:: postBody: ', postBody);
  return axios.post(reqPath, postBody)
    .catch(err => console.log(err.data));
}


// test if response string returns data
function testForData(tablePrefix, tableName, progressIndex, responseData) {
  const testString1 = 'Rezultatul solicitat nu poate fi returnat.';
  const testString2 = 'Cautarea dvs nu a returnat nici un rezultat.';

  let test = true;

  if (responseData.resultTable !== undefined) {
    // parse html string and remove '\n' substring
    const htmlTable = responseData.resultTable.replace(/\\n/g, '');
    const $ = cheerio.load(htmlTable);

    // get all text
    const textContent = $('.tempoResults').text();
    // test if text containes any of the substrings
    test = textContent.includes(testString1) || textContent.includes(testString2);
  }

  // display outcome
  if (test) {
    console.log('\x1b[31m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @testForData  >>>>>>> NOT OK !!! - retry\n`);
  } else {
    console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @testForData  >>>>>>> OK !!!\n`);
  }

  // return result
  return !test;
}


// /////////////////////////////////////////////////////////////////////////////////////////////
// transform html table to array

function html2array(tablePrefix, tableName, progressIndex, inputArr) {
  console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName}  @transformHtmlTable >>>>>>>`);

  // let returnArr = [];
  const tableHeader = [];
  let smallHeader = false;

  // parse html data
  // inputArr.forEach((item) => {
  const tableArr = [];

  const htmlTable = inputArr.resultTable.replace(/\\n/g, '');
  // console.log(htmlTable);
  const $ = cheerio.load(htmlTable);
  const len = $('td').length;
  console.log(`\n${tablePrefix} ${tableName}  @transformHtmlTable:lenght >>> ${len}`);

  // create header
  $('tr').eq(1)
    .children()
    .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });
  // console.log(tableHeader);

  // test if there are only two columns (UM + years)
  if ($('tr')
    .filter((i, row) => $(row)
      .children().length === 1).length < 4) {
    // raise small header flag / table with two columns UM + Year
    smallHeader = true;
    // reverse header ([UM, Ani] => [Ani, UM])
    tableHeader.reverse();
  } else {
    const umColumn = $('tr')
      .filter((i, row) => $(row)
        .children().length === 1)
      .slice(1)
      .eq(1);
    tableHeader.push($(umColumn).text().trim());
  }

  // add quality header
  tableHeader.push('Calitatea datelor');

  // get year column
  const yearColumn = $('tr')
    .filter((i, row) => $(row)
      .children().length === 1)
    .slice(1)
    .eq(0);

  // if we have a two column table
  if (smallHeader) {
    const rowArr = [];

    // add year item
    const yearValue = $(yearColumn).text().trim().split(' ');
    rowArr.push(yearValue[1]);

    // add data item
    const rowData = $('tr')
      .filter((i, row) => $(row).children().length > 1)
      .find('td');
    rowArr.push($(rowData).text());

    // add data quality item
    let dataQlty = 'definitive';
    if ($(rowData).has('u').length > 0) {
      // underline data stands for 'provizorii'
      dataQlty = 'provizorii';
    } else if ($(rowData).has('strong').length > 0) {
      // bold & underline data stands for 'semidefinitive'
      if ($(rowData).has('strong').has('u').length > 0) {
        dataQlty = 'semidefinitive';
      } else {
        // bold data stands for 'revizuite'
        dataQlty = 'revizuite';
      }
    }
    rowArr.push(dataQlty);

    // push new row to array
    // console.log(rowArr);
    tableArr.push(rowArr);

  // normal tables branch
  } else {
    // for each table row, except titles and info, parse data
    $('tr')
    // remove sub-header and footer rows
      .filter((i, row) => $(row).children().length > 1)
      // remove header rows
      .slice(1)
      .each((i, row) => {
        // console.log('inside first loop: ', i);
        const rowArr = [];
        $(row)
          .find('th')
          .each((j, elem) => {
            // console.log('inside second loop: ', j);
            const rowItem = $(elem).text();
            // console.log(rowItem);
            if (rowItem !== '-') {
              rowArr.push(rowItem.trim());
            } else {
              // if text is missing, copy from previous row
              rowArr.push(tableArr[tableArr.length - 1][j]);
            }
          });

        // add year item
        const yearValue = $(yearColumn).text().trim().split(' ');
        rowArr.push(yearValue[1]);

        // add data item
        const rowData = $(row).find('td');
        rowArr.push($(rowData).text());

        // add data quality item
        let dataQlty = 'definitive';
        if ($(rowData).has('u').length > 0) {
          // underline data stands for 'provizorii'
          dataQlty = 'provizorii';
        } else if ($(rowData).has('strong').length > 0) {
          // bold & underline data stands for 'semidefinitive'
          if ($(rowData).has('strong').has('u').length > 0) {
            dataQlty = 'semidefinitive';
          } else {
            // bold data stands for 'revizuite'
            dataQlty = 'revizuite';
          }
        }
        rowArr.push(dataQlty);

        // push new row to array
        // console.log(rowArr);
        tableArr.push(rowArr);
      });
  }

    // add values to the table array
    // returnArr = returnArr.concat(tableArr);
  // });

  // add header
  // returnArr.splice(0, 0, tableHeader);

  // return new array
  console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @transformHtmlTable: transform finished!`);
  // console.log(returnArr);

  // return data
  return { rows: tableArr, header: tableHeader };
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// download table for query array
async function getTableData(tablePrefix, tableName, arr, permList) {
  console.log('\x1b[34m%s\x1b[0m', '\n@getTableData >>>>>>>');

  // open write file for current table
  const startTime = new Date();
  const currentDate = dateFormat(startTime, 'isoDate');
  console.log('\x1b[35m%s\x1b[0m', `${tablePrefix} ${tableName}  @saveCSV:: create CSV file >>`);
  const file = fs.createWriteStream(`${csvOutputPath}/${currentDate}_${tablePrefix}_${tableName}.csv`);
  file.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', `${tablePrefix} ${tableName}  @saveCSV::ERROR creating CSV file >>`);
    console.log(err);
  });
  let tableHeader = [];

  const returnArray = [];

  // iterate thru array and get the corresponding data
  let i = 0;
  let retry = false;
  while (i < permList.length) {
    // progress indicator
    const progressIndex = `${i}/${permList.length - 1}`;
    if (retry) {
      console.log(`${tablePrefix} ${tableName} - ${progressIndex}  @getTableData: query - retry`);
      retry = false;
    } else {
      console.log(`${tablePrefix} ${tableName} - ${progressIndex}  @getTableData: query`);
    }

    // get data
    const tempData = await getData(tablePrefix, tableName, progressIndex, arr, permList[i]);
    // console.log(tempData.data);

    // check if response received contains data
    if (typeof tempData !== 'undefined') {
      const goodData = testForData(tablePrefix, tableName, progressIndex, tempData.data);
      if (goodData) {
        returnArray.push(tempData.data.resultTable);
        i += 1;

        // transform html to csv
        const tableData = html2array(tablePrefix, tableName, progressIndex, tempData.data);

        // if necessary, save header to file
        if (tableHeader.length === 0) {
          tableHeader = tableData.header;
          file.write(`${tableHeader.join(';')}\n`);
        }
        // save data to file
        tableData.rows.forEach((row) => { file.write(`${row.join(';')}\n`); });
        // response has no data branch
      } else {
        console.log('\x1b[31m%s\x1b[0m', `${tablePrefix} ${tableName} - ${progressIndex}  @getTableData::ERROR getData NO DATA >>`);
        console.log(tempData);
        retry = true;
      }
    // response is undefined
    } else {
      console.log('\x1b[31m%s\x1b[0m', `${tablePrefix} ${tableName} - ${progressIndex}  @getTableData::ERROR getData sends "undefined" >>`);
      console.log(tempData);
      retry = true;
    }
  }

  // close write file
  file.end();
  console.log('\x1b[35m%s\x1b[0m', `${tablePrefix} ${tableName}  @saveCSV:: DONE !!!`);

  // get current time
  const tableTimeStart = dateFormat(startTime, 'isoDateTime');
  const finishTime = new Date();
  const tableTimeEnd = dateFormat(finishTime, 'isoDateTime');

  // return table name and times
  return [tablePrefix, tableName, tableTimeStart, tableTimeEnd];
}


// transform html table to array
// function transformHtmlTable(inputArr, tableName) {
//   console.log('\x1b[34m%s\x1b[0m', `\n${tableName}  @transformHtmlTable >>>>>>>`);

//   // open file for write
//   console.log('\x1b[35m%s\x1b[0m', `\n${tableName}  @transformHtmlTable::saveCSV create file`);
//   // get current date
//   const now = new Date();
//   const currentDate = dateFormat(now, 'isoDate');
//   // open write stream
//   const file = fs.createWriteStream(`${jsonOutputPath}/${currentDate}_${tableName}.csv`);
//   file.on('error', (err) => {
// 		console.log(`\n${tableName}  @saveCSV::ERROR: writing CSV file >> `);
// 		console.log(err);
// 	});

//   // let returnArr = [];
//   const tableHeader = [];

//   // parse all query arrays
//   inputArr.forEach((item) => {
//     const tableArr = [];
//     const htmlTable = item.resultTable.replace(/\\n/g, '');
//     // console.log(htmlTable);
//     const $ = cheerio.load(htmlTable);
//     const len = $('.tempoResults').find('tr').length;
//     console.log(`\n${tableName}  @transformHtmlTable:lenght >>> ${len}`);

//     // create header, if needed
//     if (tableHeader.length === 0) {
//       $('tr').eq(1)
//         .children()
//         .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });
//       const umColumn = $('tr')
//         .filter((i, row) => $(row)
//           .children().length === 1)
//         .slice(1)
//         .eq(1);
//       tableHeader.push($(umColumn).text().trim());

//       // add quality header
// 			tableHeader.push('Calitatea datelor');
			
// 			// write header to file
// 			file.write(`${tableHeader.join(';')}\n`);
//     }

//     // get year column
//     const yearColumn = $('tr')
//       .filter((i, row) => $(row)
//         .children().length === 1)
//       .slice(1)
//       .eq(0);

//     // for each table row, except titles and info, parse data
//     $('tr')
//       // remove sub-header and footer rows
//       .filter((i, row) => $(row).children().length > 1)
//       // remove header rows
//       .slice(1)
//       .each((i, row) => {
//         // console.log('inside first loop: ', i);
//         const rowArr = [];
//         $(row)
//           .find('th')
//           .each((j, elem) => {
//             // console.log('inside second loop: ', j);
//             const rowItem = $(elem).text();
//             // console.log(rowItem);
//             if (rowItem !== '-') {
//               rowArr.push(rowItem.trim());
//             } else {
//               // if text is missing, copy from previous row
//               rowArr.push(tableArr[tableArr.length - 1][j]);
//             }
//           });

//         // add year item
//         const yearValue = $(yearColumn).text().trim().split(' ');
//         rowArr.push(yearValue[1]);

//         // add data item
//         const rowData = $(row).find('td');
//         rowArr.push($(rowData).text());

//         // add data quality item
//         let dataQlty = 'definitive';
//         if ($(rowData).has('u').length > 0) {
//           // underline data stands for 'provizorii'
//           dataQlty = 'provizorii';
//         } else if ($(rowData).has('strong').length > 0) {
//           // bold & underline data stands for 'semidefinitive'
//           if ($(rowData).has('strong').has('u').length > 0) {
//             dataQlty = 'semidefinitive';
//           } else {
//             // bold data stands for 'revizuite'
//             dataQlty = 'revizuite';
//           }
//         }
//         rowArr.push(dataQlty);

//         // push new row to array
//         // console.log(rowArr);
//         tableArr.push(rowArr);
//       });
		
// 		// write data to file
// 		console.log('\x1b[35m%s\x1b[0m', `${tableName}  @transformHtmlTable:: save data to file > `);
// 		tableArr.forEach((row) => { file.write(`${row.join(';')}\n`); });
		
//     // add values to the table array
//     // returnArr = returnArr.concat(tableArr);
//   });

//   // add header
//   // returnArr.splice(0, 0, tableHeader);

//   // return new array
//   console.log(`\n${tableName}  @transformHtmlTable:: transform finished!`);
//   // console.log(returnArr);
	
// 	// close write file
// 	file.end();
//   console.log('\x1b[35m%s\x1b[0m', `\n${tableName}  @transformHtmlTable::saveCSV - DONE!`);
// }


// download table from DB
async function downloadTable(tablePrefix, tableName, item) {
  console.log('\x1b[34m%s\x1b[0m', '\n@downloadTable >>>>>>>');

  // let outputData = [];

  // create the columns table containing all columns with all options
  const columns = item.dimensionsMap.map(column => column.options);
  console.log('@downloadTable::Columns >>> ', columns.length);
  console.log('@downloadTable::Table Name >>> ', tableName);

  // remove UM column
  const umColumn = columns.pop();
  // remove Years column
  const yearsColumn = columns.pop();

  console.log(`@downloadTable: columns.legth = ${columns.length}`);
  // console.log(umColumn);

  // create the query arrays
  const queryArrays = [];

  // calculate permutations for the remanining columns
  // test if lenght is 0, some tables have only years and UM columns
  if (columns.length > 0) {
    const builtArrays = buildPermutations(columns, queryLimit);
    // create the query arrays
    yearsColumn.forEach((year) => {
      builtArrays.forEach((perm) => {
        queryArrays.push([...perm, [year], umColumn]);
      });
    });
  } else {
    yearsColumn.forEach((year) => {
      queryArrays.push([[year], umColumn]);
    });
  }

  // request data
  const response = await getTableData(tablePrefix, tableName, item, queryArrays);

  // return table
  return response;
}


// write table data to CSV file
// function saveCSV(tableData, tableName) {
//   console.log('\x1b[34m%s\x1b[0m', `\n@saveCSV::Write data to table: ${tableName}`);

//   const now = new Date();
//   const currentDate = dateFormat(now, 'isoDate');

//   // write table to file
//   const file = fs.createWriteStream(`${jsonOutputPath}/${currentDate}_${tableName}.csv`);
//   file.on('error', (err) => { console.log('@saveCSV::ERROR: writing CSV file >> ', err); });
//   tableData.forEach((row) => { file.write(`${row.join(';')}\n`); });
//   file.end();
//   console.log(`@saveCSV::Done - Table ${tableName}`);
// }


// write table data to JSON file
// function saveJSON(tablePrefix, tableName, htmlArray) {
//   console.log('\x1b[34m%s\x1b[0m', `\n@saveJSON::Write data to table: ${tablePrefix} ${tableName}`);

//   const now = new Date();
//   const currentDate = dateFormat(now, 'isoDate');

//   const output = {};
//   output.tableName = tableName;
//   output.html = htmlArray;

//   // write table to file
//   fs.writeFile(`${jsonOutputPath}/${currentDate}_${tablePrefix}_${tableName}.json`, JSON.stringify(output), 'utf8', () => console.log(`${tableName} @saveJSON - Done!`));
// }


// ///////////////////////////////////////////////////////////////////////////////////////
// // download DataBase data from INSSE

function downloadDB(ancestorsFilePath, headersFilePath) {
  console.log('\x1b[34m%s\x1b[0m', '\n@downloadDB >>>>>>>');

  const durationArr = [];

  // start timer
  const dbStartTime = new Date();
  const dbStartDate = dateFormat(dbStartTime, 'isoDate');
  console.log('\x1b[33m%s\x1b[0m', '@downloadDB:: Timer started\n');

  // read table ancestors from file
  const tempoL1 = readFile(ancestorsFilePath);
  const ancestors = tempoL1.level1;

  // read table headers from file
  const tempoL3 = readFile(headersFilePath);

  // // test saveJSON file
  // const testJson = readFile(`${jsonOutputPath}/2018-12-11_A.1_POP107B.json`);
  // testJson.html.forEach((item) => { console.log(item); });

  // separate the array into 4 chunks
  const batchArray = [
    tempoL3.level3.slice(0, 100),
    tempoL3.level3.slice(100, 200),
    tempoL3.level3.slice(200, 300),
    tempoL3.level3.slice(300, 400),
    tempoL3.level3.slice(400, 500),
    tempoL3.level3.slice(500, 600),
    tempoL3.level3.slice(600, 700),
    tempoL3.level3.slice(700, 800),
    tempoL3.level3.slice(800, 900),
    tempoL3.level3.slice(900, 100),
    tempoL3.level3.slice(1000, 1100),
    tempoL3.level3.slice(1100, 1200),
    tempoL3.level3.slice(1200, 1300),
    tempoL3.level3.slice(1300),
  ];

  // open log save file
  const logFile = fs.createWriteStream(`${csvOutputPath}/${dbStartDate}__log_file.csv`);
  logFile.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', 'Log file started >>');
    console.log(err);
  });
  const logFileHeader = ['prefix', 'tableName', 'startTime', 'finishTime'];
  logFile.write(`${logFileHeader.join(';')}\n`);

  // // test individual table
  // tempoL3.level3.filter(item => item.tableName === 'GOS109A').forEach(async (element) => {

  batchArray.forEach(async (batch) => {
    // for each table header get table data
    for (element of batch) {
  
      // start timer
      const tableStartTime = new Date();
      const tableCode = element.ancestors[3].code;
      const parentCode = element.ancestors[2].code;

      // get ancestors data
      const tableIndex = ancestors.filter(item => item.context.code === tableCode)[0].context.name.split(' ')[0].replace('.', '');
      const ancestorPrefix = ancestors.filter(item => item.context.code === parentCode)[0].context.name.split(' ')[0];
      const tablePrefix = `${ancestorPrefix}.${tableIndex}`;
      const { tableName } = element;
      const now = new Date();
      const currentDate = dateFormat(now, 'isoDate');
      const filePath = `${csvOutputPath}/${currentDate}_${tablePrefix}_${tableName}.csv`;

      // test if file exists
      if (fs.existsSync(filePath)) {
        // continue;
      } else {
        // download table from DB
        try {
          console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} @downloadDB:: download started ...`);
          const response = await downloadTable(tablePrefix, tableName, element);
          // save table times to file
          logFile.write(`${response.join(';')}\n`);
        } catch (err) { console.log(err); }
  
        // print execution time for table
        const tableDuration = new Date() - tableStartTime;
        durationArr.push(tableDuration);
        console.info('\x1b[33m%s\x1b[0m', `\nTable execution time: ${Math.floor(tableDuration / 1000)}s`);
  
        const passedTime = new Date() - dbStartTime;
        console.info('\x1b[33m%s\x1b[0m', `Elapsed execution time: ${Math.floor(passedTime / 1000)}s`);
      };
    // end for loop
    }
  // end batchArray forEach loop
  });
  // });


  // end timer
  // const dbDuration = new Date() - dbStartTime;
  // console.info('\x1b[33m%s\x1b[0m', `\nDB execution time: ${Math.floor(dbDuration / 1000)}s`);
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN

downloadDB(tempoL1File, tempoL3File);
