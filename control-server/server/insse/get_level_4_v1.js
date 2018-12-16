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
// const jsonOutputPath = '../../../docker-data/control/insse/json';
const csvOutputPath = '../../../docker-data/control/insse/csv';
const tempoL1File = `${inputPath}/tempoL1.json`;
const tempoL3File = `${inputPath}/tempoL3.json`;
const requestPath = 'http://statistici.insse.ro:8077/tempo-ins/matrix/';
// const tempoL3 = { level3: [] };
// const stringifier = csv.stringify();
// INSSE Tempo query limit (no of cells)
const queryLimit = 30000;


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


// ////////////////////////////////////////////////////////////////////////////////////////////
// for item in list and given array of columns, create POST body
function createPostBody(header, permutation) {
  const postBody = {};
  postBody.language = 'ro';
  postBody.arr = permutation;
  postBody.matrixName = header.matrixName;
  postBody.matrixDetails = header.details;

  return postBody;
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// create array for culumn given
function groupColumnItems(column, parenthood, limit) {
  // create a work array
  let workColumn = column;
  let newLimit = 0;
  // console.log('@group::workColumn: ', workColumn);
  console.log('\x1b[34m%s\x1b[0m', '\n@groupColumnItems >>>>>>>');
  console.log('@group::limit: ', limit);
  console.log('@group::parenthood = ', parenthood);
  // initialize the return array
  const returnArr = {
    type: 'regular',
    values: [],
    dependent: false,
  };
  // check if current column has dependency
  returnArr.dependent = workColumn[0].parentId !== null;
  console.log('@group::dependent = ', returnArr.dependent);
  // check if current column is parent
  console.log('parenthood = ', parenthood);

  // if column has children items and items are not also parents
  if (returnArr.dependent && !parenthood) {
    console.log('\x1b[36m%s\x1b[0m', '@group:: children branch');
    // save 'Total' column separately
    // let totalColumn = null;
    // if (workColumn[0].parentId === workColumn[0].nomItemId) totalColumn = workColumn.shift();
    // there ara parents with no depending children, just total column (ex: G.1.1 GOS109A)
    // set a group for total
    // returnArr.values.push([totalColumn]);

    // create array of Children by grouping items with same parrent
    while (workColumn.length > 0) {
      const searchId = workColumn[0].parentId;
      returnArr.type = 'children';
      returnArr.values.push(workColumn.filter(item => item.parentId === searchId));
      returnArr.dependent = true;
      workColumn = workColumn.filter(item => item.parentId !== searchId);
    }

    // calculate new limit dividing the current limit to the largest group of items in array
    const lenghtsArr = returnArr.values.map(item => item.length);
    newLimit = Math.floor(limit / Math.max(...lenghtsArr));

  // if column has parent items
  } else if (parenthood) {
    console.log('\x1b[36m%s\x1b[0m', '@group:: parent branch');
    returnArr.type = 'parents';
    // remove 'total' cell
    // if (workColumn[0].label.toLowerCase().trim() === 'total') workColumn.shift();
    // return items
    returnArr.values = workColumn.map(item => [item]);
    // one item array does not influence the limit, return same limit
    newLimit = limit;

  // if column has regular items
  // // if query limit has been reached, group elements in one items arrays
  } else if (limit === 0) {
    console.log('\x1b[36m%s\x1b[0m', '@group:: limit === 0 branch');
    returnArr.values = workColumn.map(item => [item]);
    // console.log(returnArr.values);

  // // if query limit is not reached, make one array with all items
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

  // // if query limit is not reached, but is smaller than the amount of items
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
  return { returnArr, newLimit };
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// build permutations
function buildPermutations(columns, limit) {
  console.log('\x1b[34m%s\x1b[0m', '\n@buildPermutations >>>>>>>');

  let workLimit = limit;
  let permutations = [];
  const typeArray = [];
  let parenthood = false;
  let tableType = 'regular';

  // iterate over array of columns and build the permutations
  columns.reverse().forEach((column, index) => {
    // for each column return items grouped
    const groupedColumn = groupColumnItems(column, parenthood, workLimit);
    console.log(`@build:: column: ${index}   >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
    // console.log(groupedColumn.returnArr.values);

    // create work array
    const newPermutations = [];
    // update type Array
    typeArray.push(groupedColumn.returnArr.type);
    // update Limit
    workLimit = groupedColumn.newLimit;
    // update parenthood for next column
    // // if current items are children set parenthood to true
    if (groupedColumn.returnArr.type === 'children') {
      parenthood = true;
    // // if current items are parents of parents
    } else if (groupedColumn.returnArr.type === 'parents' && groupedColumn.returnArr.dependent) {
      parenthood = true;
    // // if current items have no dependency
    } else {
      parenthood = false;
    }

    // create permutation array
    // if first column, add directly (I presuppose: the first column has fewer elements than limit: 30000)
    if (index === 0) {
      console.log('\n@build:: first column branch');
      newPermutations.push(groupedColumn.returnArr.values);

      // column contains parents
    } else if (groupedColumn.returnArr.type === 'parents') {
      console.log('\n@build:: parents branch');

      // console.log(lastPermutation);
      // get total column permutation
      const totalPermutation = permutations.filter((child) => {
        return child[0][0].label.trim().toLowerCase() === 'total';
      });
      // console.log(totalPermutation);

      // if last column were parents
      if (typeArray[typeArray.length - 2] === 'parents') {
        console.log('\n@build:: parents branch <<<<< parents');
        // for each parent
        groupedColumn.returnArr.values.forEach((parent) => {
          // find all children
          const children = permutations.filter((child) => {
            // console.log(child);
            return child[0][0].parentId === parent[0].nomItemId;
          });
          // console.log('\n@build:: parents branch <<<<< parents.length = ', children.length);

          // if parent has children, pair parent with each child
          if (children.length > 0) {
            children.forEach((child) => { newPermutations.push([parent, ...child]); });
          }
          // console.log(newPermutations[1]);

          // also pair parent with total permutation
          newPermutations.push([parent, ...totalPermutation]);
        });

      // if last column were children
      } else if (typeArray[typeArray.length - 2] === 'children') {
        console.log('\n@build:: parents branch <<<<< children');
        // for each parent
        groupedColumn.returnArr.values.forEach((parent) => {
          // find all children
          const children = permutations.filter(child => child[0][0].parentId === parent[0].nomItemId);
          // console.log('\n@build:: parents branch <<<<< children.length = ', children.length);
          // console.log(children);

          // if parent has children, pair parent with children
          if (children.length > 0) {
            newPermutations.push([parent, ...children[0]]);
          }

          // also pair parent with total permutation
          newPermutations.push([parent, ...totalPermutation[0]]);
        });
      }

    // column contains children
    } else if (groupedColumn.returnArr.type === 'children') {
      console.log('\n@build:: children branch');
      groupedColumn.returnArr.values.forEach((item) => {
        permutations.forEach((elem) => {
          newPermutations.push([item, ...elem]);
        });
      });

    // column contains regular items
    } else {
      console.log('\n@build:: regular branch');
      // console.log(groupedColumn.returnArr.values);
      groupedColumn.returnArr.values.forEach((item) => {
        permutations.forEach((elem) => {
          newPermutations.push([item, ...elem]);
        });
      });
    }

    // save new Permutations to stable permutations
    permutations = newPermutations;
    console.log(`@build ${index}::permutations >>> DONE`);
    // console.log(permutations[1]);
  });

  // determine table type
  const numOfParents = typeArray.filter(item => item === 'parent').length;
  if (numOfParents === 1) tableType = 'one-parent';
  if (numOfParents > 1) tableType = 'multiple-parents';

  // return permutations array
  return { permutations, tableType };
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// query function
function getData(tablePrefix, tableName, progressIndex, arr, permList) {
  const reqPath = requestPath + tableName;
  console.log('\x1b[34m%s\x1b[0m', `${tablePrefix} ${tableName} - ${progressIndex}  @getData >>>>>>>`);

  // console.log('@getData::request path: ', reqPath);
  const postBody = createPostBody(arr, permList);
  // console.log('@getData:: postBody: ', postBody.arr);
  return axios.post(reqPath, postBody)
    .catch(err => console.log(err.data));
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// test if response string returns data
function testForData(tablePrefix, tableName, progressIndex, responseData) {
  const testString1 = 'Rezultatul solicitat nu poate fi returnat.';
  const testString2 = 'Cautarea dvs nu a returnat nici un rezultat.';

  let test = true;

  if (responseData.resultTable != null) {
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

function html2array(tablePrefix, tableName, tableType, progressIndex, inputArr) {
  console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @transformHtmlTable >>>>>>> START`);

  // create return variables
  const tableHeader = [];
  const tableArr = [];

  // remove unnecessary '\n' characters
  const htmlTable = inputArr.resultTable.replace(/\\n/g, '');

  // process html table
  const $ = cheerio.load(htmlTable);
  const len = $('td').length;
  console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @transformHtmlTable:lenght >>> ${len}`);

  // if table received has no data
  if ($('tr').find('td').length === 2) {
    console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @transformHtmlTable >>>>>>> NO DATA`);
    // return empty array and empty header
    return { rows: tableArr, header: tableHeader };
  }

  // if table type is regular
  if (tableType === 'regular') {
    // create header
    $('tr').eq(1)
      .children()
      .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });
    // console.log(tableHeader);

    // get UM column
    const umColumn = $('tr')
      .filter((i, row) => $(row)
        .children().length === 1)
      .slice(1)
      .eq(1);
    tableHeader.push($(umColumn).text().trim());

    // add quality header
    tableHeader.push('Calitatea datelor');

    // get year column
    const yearColumn = $('tr')
      .filter((i, row) => $(row)
        .children().length === 1)
      .slice(1)
      .eq(0);

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

    // return new array
    console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @transformHtmlTable: ${tableType} transform finished!`);
    // console.log(returnArr);

    // return data
    return { rows: tableArr, header: tableHeader };
  }

  // if table has only two columns (UM + years)
  if (tableType === 'two-columns') {
    // create header
    $('tr').eq(1)
      .children()
      .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });
    // console.log(tableHeader);

    // reverse header ([UM, Ani] => [Ani, UM])
    tableHeader.reverse();

    // add quality header
    tableHeader.push('Calitatea datelor');

    // get year column
    const yearColumn = $('tr')
      .filter((i, row) => $(row)
        .children().length === 1)
      .slice(1)
      .eq(0);

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

    // return new array
    console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @transformHtmlTable: ${tableType} transform finished!`);
    // console.log(returnArr);

    // return data
    return { rows: tableArr, header: tableHeader };
  }

  // if table has multiple parents
  if (tableType === 'multiple-parents') {
  
    // return new array
    console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @transformHtmlTable: ${tableType} transform finished!`);
    // console.log(returnArr);

    // return data
    return { rows: tableArr, header: tableHeader };
  }

  // if none of the above options work, send empty array and header
  return { rows: tableArr, header: tableHeader };
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// download table for query array
async function getTableData(tablePrefix, tableName, tableType, arr, permList, errorFile) {
  console.log('\x1b[34m%s\x1b[0m', '\n@getTableData >>>>>>>');

  // open write file for current table
  const startTime = new Date();
  const currentDate = dateFormat(startTime, 'isoDate');
  console.log('\x1b[35m%s\x1b[0m', `${tablePrefix} ${tableName}  @saveCSV:: write CSV file >>`);
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
    if (tempData != null) {
      const goodData = testForData(tablePrefix, tableName, progressIndex, tempData.data);
      if (goodData) {
        returnArray.push(tempData.data.resultTable);
        i += 1;

        // transform html to csv
        const tableData = html2array(tablePrefix, tableName, tableType, progressIndex, tempData.data);

        // test if html transform returns data
        if (tableData.rows.length > 0) {
          // if necessary, save header to file
          if (tableHeader.length === 0) {
            tableHeader = tableData.header;
            file.write(`${tableHeader.join(';')}\n`);
          }
          // save data to file
          tableData.rows.forEach((row) => { file.write(`${row.join(';')}\n`); });
        }
      // response has no data branch
      } else {
        console.log('\x1b[31m%s\x1b[0m', `${tablePrefix} ${tableName} - ${progressIndex}  @getTableData::ERROR getData NO DATA >>`);
        // console.log(tempData);
        retry = true;

        // save error to log
        errorFile.write(`${tablePrefix};${tableName};${progressIndex};getTableData;NO DATA\n`);
      }
    // response is undefined
    } else {
      console.log('\x1b[31m%s\x1b[0m', `${tablePrefix} ${tableName} - ${progressIndex}  @getTableData::ERROR getData sends "undefined" >>`);
      // console.log(tempData);
      retry = true;

      // save error to log
      errorFile.write(`${tablePrefix};${tableName};${progressIndex};getTableData;undefined\n`);
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


// ////////////////////////////////////////////////////////////////////////////////////////////
// download table from DB
async function downloadTable(tablePrefix, tableName, table, errorFile) {
  console.log('\x1b[34m%s\x1b[0m', '\n@downloadTable >>>>>>>');

  // let outputData = [];

  // create the columns table containing all columns with all options
  const columns = table.dimensionsMap.map(column => column.options);
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
  let tableKind = '';

  // calculate permutations for the remanining columns
  // test if lenght is 0, some tables have only years and UM columns
  if (columns.length > 0) {
    const { permutations, tableType } = buildPermutations(columns, queryLimit);
    tableKind = tableType;
    // create the query arrays
    yearsColumn.forEach((year) => {
      permutations.forEach((perm) => {
        queryArrays.push([...perm, [year], umColumn]);
      });
    });
  } else {
    tableKind = 'two-columns';
    yearsColumn.forEach((year) => {
      queryArrays.push([[year], umColumn]);
    });
  }

  // request data
  const response = await getTableData(tablePrefix, tableName, tableKind, table, queryArrays, errorFile);

  // return table
  return response;
}


// ///////////////////////////////////////////////////////////////////////////////////////
// // get one table
async function getTable(programIndex, dbStartTime, dbStartDate, tableId) {

  const durationArr = [];

  // read table ancestors from file
  const tempoL1 = readFile(tempoL1File);
  const ancestors = tempoL1.level1;

  // read table headers from file
  const tempoL3 = readFile(tempoL3File);

  // open log to save table errors
  const errorFile = fs.createWriteStream(`${csvOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`);
  errorFile.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', 'ERROR Log file started >>');
    console.log(err);
  });
  const logErrorHeader = ['tablePrefix', 'tableName', 'progressIndex', 'process', 'message'];
  errorFile.write(`${logErrorHeader.join(';')}\n`);

  // open log to save tables completed and times
  const logFile = fs.createWriteStream(`${csvOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`);
  logFile.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', 'TABLES Log file started >>');
    console.log(err);
  });
  const logTablesHeader = ['prefix', 'tableName', 'startTime', 'finishTime'];
  logFile.write(`${logTablesHeader.join(';')}\n`);


  // get table header from
  const tablesList = tempoL3.level3.filter(item => item.tableName === tableId);

  // if table was not found
  if (tablesList.length === 0) {
    console.log(`ERROR: no table with ${tableId} name was found!`);

  // if table was found
  } else {
    // assign found table to element
    const element = tablesList[0];

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
      console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} @downloadDB:: file already exists, next table ...`);
    } else {
      // create CSV file to stop other processes from working on it
      fs.writeFileSync(`${csvOutputPath}/${currentDate}_${tablePrefix}_${tableName}.csv`, '', 'utf8');
      console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} @downloadDB:: file created, start process ...`);

      // download table from DB
      try {
        console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} @downloadDB:: download started ...`);
        const response = await downloadTable(tablePrefix, tableName, element, errorFile);
        // save table times to file
        logFile.write(`${response.join(';')}\n`);
      } catch (err) { console.log(err); }

      // print execution time for table
      const tableDuration = new Date() - tableStartTime;
      durationArr.push(tableDuration);
      console.info('\x1b[33m%s\x1b[0m', `\nTable execution time: ${Math.floor(tableDuration / 1000)}s`);

      const passedTime = new Date() - dbStartTime;
      console.info('\x1b[33m%s\x1b[0m', `Elapsed execution time: ${Math.floor(passedTime / 1000)}s`);
    // end for loop
    }
    // end test individual table
  }
}


// ///////////////////////////////////////////////////////////////////////////////////////
// // get all tables
function getTables(programIndex, dbStartTime, dbStartDate) {

  const durationArr = [];

  // read table ancestors from file
  const tempoL1 = readFile(tempoL1File);
  const ancestors = tempoL1.level1;

  // read table headers from file
  const tempoL3 = readFile(tempoL3File);

  // open log to save table errors
  const errorFile = fs.createWriteStream(`${csvOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`);
  errorFile.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', 'ERROR Log file started >>');
    console.log(err);
  });
  const logErrorHeader = ['tablePrefix', 'tableName', 'progressIndex', 'process', 'message'];
  errorFile.write(`${logErrorHeader.join(';')}\n`);

  // open log to save tables completed and times
  const logFile = fs.createWriteStream(`${csvOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`);
  logFile.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', 'TABLES Log file started >>');
    console.log(err);
  });
  const logTablesHeader = ['prefix', 'tableName', 'startTime', 'finishTime'];
  logFile.write(`${logTablesHeader.join(';')}\n`);

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

  // for each batch loop
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
        console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} @downloadDB:: file already exists, next table ...`);
      } else {
        // create CSV file to stop other processes from working on it
          fs.writeFileSync(`${csvOutputPath}/${currentDate}_${tablePrefix}_${tableName}.csv`, '', 'utf8');
          console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} @downloadDB:: file created, start process ...`);

        // download table from DB
        try {
          console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} @downloadDB:: download started ...`);
          const response = await downloadTable(tablePrefix, tableName, element, errorFile);
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
}


// ///////////////////////////////////////////////////////////////////////////////////////
// // download DataBase data from INSSE

function downloadDB() {
  // start timer
  const dbStartTime = new Date();
  const dbStartDate = dateFormat(dbStartTime, 'isoDate');
  console.log('\x1b[33m%s\x1b[0m', '@downloadDB:: Timer started\n');

  // get third command line argument
  const tableName = process.argv[2] || '';
  console.log('\x1b[34m%s\x1b[0m', `\n@downloadDB >>>>>>> ${tableName}`);

  // test if log files exist, else create them and determine index
  let programIndex = 0;
  while (true) {
    // test if file exists
    if (fs.existsSync(`${csvOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`) || fs.existsSync(`${csvOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`)) {
      programIndex += 1;
    } else {
      // create CSV log files to lock programIndex
      fs.writeFileSync(`${csvOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`);
      fs.writeFileSync(`${csvOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`);
      break;
    }
  }

  // if tableName is not empty, download table - usually for testing purposes
  if (tableName !== '') {
    getTable(programIndex, dbStartTime, dbStartDate, tableName);

  // else, download all tables
  } else {
    getTables(programIndex, dbStartTime, dbStartDate);
  }


  // end timer
  // const dbDuration = new Date() - dbStartTime;
  // console.info('\x1b[33m%s\x1b[0m', `\nDB execution time: ${Math.floor(dbDuration / 1000)}s`);
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN

downloadDB();
