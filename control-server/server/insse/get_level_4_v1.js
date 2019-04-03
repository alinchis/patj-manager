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
const glob = require('glob');

// paths
const inputPath = '../../../docker-data/control/insse';
// const jsonOutputPath = '../../../docker-data/control/insse/json';
const csvOutputPath = '../../../docker-data/control/insse/csv/';
const logOutputPath = '../../../docker-data/control/insse/logs/';
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
    console.log('\x1b[36m%s\x1b[0m', '@group:: limit > column.length branch');
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
    if (groupedColumn.returnArr.type === 'parents') {
      console.log('\n@build:: parents branch');

      // console.log(lastPermutation);
      // get total column permutation
      // console.log(permutations);
      const totalPermutation = permutations.filter((child) => {
        return child[0][0].label.trim().toLowerCase() === 'total';
      });
      // console.log(totalPermutation);

      // // if last column were parents
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
          if (totalPermutation.length > 0) {
            newPermutations.push([parent, ...totalPermutation[0]]);
          }
        });

        // // if last column were children
      } else if (typeArray[typeArray.length - 2] === 'children') {
        console.log('\n@build:: parents branch <<<<< children');
        // console.log(permutations);
        // for each parent
        groupedColumn.returnArr.values.forEach((parent) => {
          // find all children
          const children = permutations.filter((child) => {
            // console.log('\n@build:: parents branch <<<<< children child = ', child);
            return child[0][0].parentId === parent[0].nomItemId;
          });
          // console.log('\n@build:: parents branch <<<<< children.length = ', children.length);
          // console.log(children);

          // if parent has children, pair parent with children
          if (children.length > 0) {
            children.forEach((child) => { newPermutations.push([parent, ...child]); });
            // console.log(newPermutations[newPermutations.length - 1]);
          }

          // also pair parent with total permutation (except the total column, if already added)
          // // if this parent is 'total' and has children
          // console.log('parent: ', parent);
          if (parent[0].label.trim().toLowerCase() === 'total' && children.length > 0) {
            // do nothing, total parents can have only total children
            // // else, if total permutation is not null
          } else if (totalPermutation.length > 0) {
            // add parent and total permutation pair
            // console.log(totalPermutation);
            newPermutations.push([parent, ...totalPermutation[0]]);
            // console.log(newPermutations[newPermutations.length - 1]);
          }
        });
      }

      // column contains children
    } else if (groupedColumn.returnArr.type === 'children') {
      // if first column
      if (permutations.length > 0) {
        console.log('\n@build:: children branch >>> NOT first column');
        // console.log(groupedColumn.returnArr.values);
        groupedColumn.returnArr.values.forEach((item) => {
          // console.log(item);
          permutations.forEach((elem) => {
            // console.log(elem);
            newPermutations.push([item, ...elem]);
            // console.log(newPermutations[newPermutations - 1]);
          });
        });
      } else {
        console.log('\n@build:: children branch >>> first column');
        // console.log(groupedColumn.returnArr.values);
        groupedColumn.returnArr.values.forEach((item) => {
          // console.log(item);
          newPermutations.push([item]);
          // console.log(newPermutations[newPermutations - 1]);
        });
      }

      // column contains regular items
    } else {
      // if first column
      if (permutations.length > 0) {
        console.log('\n@build:: regular branch >>> NOT first column');
        // console.log(permutations);
        // console.log(groupedColumn.returnArr.values);
        groupedColumn.returnArr.values.forEach((item) => {
          permutations.forEach((elem) => {
            newPermutations.push([item, ...elem]);
          });
        });
      } else {
        console.log('\n@build:: regular branch >>> first column');
        // console.log(permutations);
        // console.log(groupedColumn.returnArr.values);
        groupedColumn.returnArr.values.forEach((item) => {
          newPermutations.push([item]);
        });
      }
    }

    // save new Permutations to stable permutations
    permutations = newPermutations;
    console.log(`@build ${index}::permutations >>> DONE`);
    // console.log(permutations);
  });

  // determine table type
  const numOfParents = typeArray.filter(item => item === 'parents').length;
  if (numOfParents === 1) tableType = 'one-parent';
  if (numOfParents > 1) tableType = 'multiple-parents';

  // return permutations array
  return { permutations, tableType };
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// query function
function getData(tablePrefix, tableName, progressIndex, arr, permList, errorFile) {
  const reqPath = requestPath + tableName;
  console.log('\x1b[34m%s\x1b[0m', `${tablePrefix} ${tableName} - ${progressIndex}  @getData >>>>>>>`);

  // console.log('@getData::request path: ', reqPath);
  const postBody = createPostBody(arr, permList);
  // console.log('@getData:: postBody: ', postBody.arr);
  return axios.post(reqPath, postBody)
    .catch((err) => {
      console.log('\x1b[31m%s\x1b[0m', `${tablePrefix} ${tableName} - ${progressIndex}  @getData::ERROR axios >>`);
      // save error to log
      errorFile.write(`${tablePrefix};${tableName};${progressIndex};getData;axios\n`);
      return err.data;
    });
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// test if response string returns data
function testForData(tablePrefix, tableName, progressIndex, responseData) {
  // const testString1 = 'Rezultatul solicitat nu poate fi returnat.';
  // const testString2 = 'Cautarea dvs nu a returnat nici un rezultat.';
  const testString3 = 'Legenda:';

  let test = false;

  if (responseData.resultTable != null) {
    // parse html string and remove '\n' substring
    const htmlTable = responseData.resultTable.replace(/\\n/g, '');
    const $ = cheerio.load(htmlTable);

    // get all text
    const textContent = $('.tempoResults').text();
    // test if text containes any of the substrings
    // test = textContent.includes(testString1) || textContent.includes(testString2);
    test = textContent.includes(testString3);
  }

  // display outcome
  if (!test) {
    console.log('\x1b[31m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @testForData  >>>>>>> NOT OK !!! - retry\n`);
  } else {
    console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @testForData  >>>>>>> OK !!!\n`);
  }

  // return result
  return test;
}


// /////////////////////////////////////////////////////////////////////////////////////////////
// transform html table to array

function html2array(tablePrefix, tableName, tableType, headerFlag, tableHead, yearKind, details, progressIndex, inputArr) {
  console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array >>>>>>> START`);

  // create return variables
  const tableHeader = headerFlag ? tableHead : [];
  const tableArr = [];
  let yearType = yearKind;

  // remove unnecessary '\n' characters
  const htmlTable = inputArr.resultTable.replace(/\\n/g, '');
  // console.log(htmlTable);

  // process html table
  const $ = cheerio.load(htmlTable);
  const trArray = $('tr');
  const len = $('td').length - 2;
  console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array: tableType = ${tableType}`);
  console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array:lenght >>> ${len}`);

  // if table received has no data
  if (len === 0) {
    console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array >>>>>>> NO DATA`);
    // return empty array and empty header
    return { rows: tableArr, header: tableHeader };
  }

  // check how many data colmns table has
  const testYears = $(trArray).eq(2).children().length;
  console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array: data columns === ${testYears}`);


  // //////////////////////////////////////////////////////////
  // if table has only one data column
  if (testYears === 1) {

    // ////////////////////////////////////
    // if table type is regular or one-parent
    if (tableType === 'regular' || tableType === 'one-parent') {
      console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array >>>>>>> regular table`);
      // create header if flag is false
      if (!headerFlag) {
        $(trArray).eq(1)
          .children()
          .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });
        yearType = tableHeader[tableHeader.length - 1].trim().toLowerCase();
        if (yearType === 'trimestre' || yearType === 'perioade' || yearType === 'luni') tableHeader.push('Ani');
        // get UM column, if is not specified in a separate column
        if (details.matUMSpec === 0) {
          const umColumn = $(trArray).eq(3);
          tableHeader.push($(umColumn).text().trim());
        }
        tableHeader.push('Valoare');

        // add quality header
        tableHeader.push('Calitatea datelor');
        // console.log(tableHeader);
      }

      // get year column
      const yearColumn = [];
      $(trArray).eq(2).children().each((i, row) => {
        yearColumn.push($(row).text().trim());
      });
      // console.log('year column: ', yearColumn);

      // get UM column
      const umColumn = $(trArray).eq(4);

      // for each table row, except titles and info, parse data
      $(trArray)
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
              const rowItem = $(elem).text().trim();
              // console.log(rowItem);
              if (rowItem !== '-') {
                rowArr.push(rowItem);

                // if text is missing, copy from previous row
              } else if (tableArr.length > 0) {
                rowArr.push(tableArr[tableArr.length - 1][j]);
                // if first row, copy from header
              } else {
                rowArr.push(tableHeader[j]);
              }
            });

          // add year item
          const yearValue = yearColumn[0].split(' ');
          if (yearType === 'ani') {
            rowArr.push(yearValue[1]);
          } else if (yearType === 'trimestre') {
            rowArr.push(yearValue[1]);
            rowArr.push(yearValue[2]);
          } else if (yearType === 'perioade') {
            if (yearValue.length === 2) {
              rowArr.push('anual');
              rowArr.push(yearValue[1]);
            } else {
              rowArr.push(yearValue[1]);
              rowArr.push(yearValue[2]);
            }
          } else if (yearType === 'luni') {
            rowArr.push(yearValue[1]);
            rowArr.push(yearValue[2]);
          }

          // if tables don't have UM delivered with data
          if (details.matUMSpec === 0) {
            // add UM item
            rowArr.push($(umColumn).text().trim());
          }

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

      // return data
      console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array: ${tableType} transform finished!`);
      // console.log(returnArr);
      return { rows: tableArr, header: tableHeader, yearType };
    }

    // ////////////////////////////////////
    // if table has only two columns (UM + years)
    if (tableType === 'two-columns') {
      console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array >>>>>>> two-columns table`);
      // create header if flag is false
      if (!headerFlag) {
        $(trArray).eq(1)
          .children()
          .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });

        // create a new column for values
        tableHeader.splice(1, 0, 'Valoare');

        // add quality header
        tableHeader.push('Calitatea datelor');
        // console.log(tableHeader);
      }

      // get year column
      const yearColumn = [];
      $(trArray).eq(2).children().each((i, row) => {
        yearColumn.push($(row).text().trim());
      });
      // console.log('year column: ', yearColumn);

      const rowArr = [];

      // add data item
      const rowData = $(trArray).eq(3).children();
      $(rowData).each((i, value) => {
        rowArr.push($(value).text());
      });

      // add year item
      const yearValue = yearColumn[0].split(' ');
      rowArr.push(yearValue[1]);

      // add data quality item
      const dataItem = $(rowData).eq(1);
      let dataQlty = 'definitive';
      if ($(dataItem).has('u').length > 0) {
        // underline data stands for 'provizorii'
        dataQlty = 'provizorii';
      } else if ($(dataItem).has('strong').length > 0) {
        // bold & underline data stands for 'semidefinitive'
        if ($(dataItem).has('strong').has('u').length > 0) {
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

      // return data
      console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array: ${tableType} transform finished!`);
      // console.log(returnArr);
      return { rows: tableArr, header: tableHeader, yearType };
    }

    // ////////////////////////////////////
    // if table has multiple parents
    if (tableType === 'multiple-parents') {
      console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array >>>>>>> multiple-parents table`);
      // create header if flag is false
      if (!headerFlag) {
        $(trArray).eq(1)
          .children()
          .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });

        // add value header
        tableHeader.push('Valoare');

        // add quality header
        tableHeader.push('Calitatea datelor');
      }

      // get year column
      const yearColumn = $(trArray)
        .filter((i, row) => $(row)
          .children().length === 1)
        .slice(1)
        .eq(0);

      // for each table row, except titles and info, parse data
      $(trArray)
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

      // return data
      console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array: ${tableType} transform finished!`);
      // console.log(tableArr);
      return { rows: tableArr, header: tableHeader, yearType };
    }


    // //////////////////////////////////////////////////////////
    // if table has more than one data column
  } else {

    // ////////////////////////////////////
    // if table type is regular or one-parent
    if (tableType === 'regular' || tableType === 'one-parent') {
      console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array >>>>>>> regular table`);
      // create header if flag is false
      if (!headerFlag) {
        $(trArray).eq(1)
          .children()
          .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });
        yearType = tableHeader[tableHeader.length - 1].trim().toLowerCase();
        if (yearType === 'trimestre' || yearType === 'perioade' || yearType === 'luni') tableHeader.push('Ani');

        // get UM column, if is not specified in a separate column
        if (details.matUMSpec === 0) {
          const umColumn = $(trArray).eq(3);
          tableHeader.push($(umColumn).text().trim());
        }

        // create a new column for values
        tableHeader.push('Valoare');

        // add quality header
        tableHeader.push('Calitatea datelor');
        // console.log(tableHeader);
      }

      // get UMs column
      const umsColumn = [];
      $(trArray).eq(4).children().each((i, row) => {
        umsColumn.push($(row).text().trim());
      });
      // console.log('UMs column: ', umsColumn);

      // get year column
      const yearColumn = [];
      $(trArray).eq(2).children().each((i, row) => {
        yearColumn.push($(row).text().trim());
      });
      // console.log('year column: ', yearColumn);

      // for each table row, except titles and info, parse data
      $(trArray)
        // remove sub-header and footer rows
        .filter((i, row) => $(row).children().length > 1)
        // remove header rows
        .slice(3)
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
                rowArr.push(rowItem);

                // if text is missing, copy from previous row
              } else if (tableArr.length > 0) {
                rowArr.push(tableArr[tableArr.length - 1][j]);
                // if first row, copy from header
              } else {
                rowArr.push(tableHeader[j]);
              }
            });

          // add year item
          const yearValue = yearColumn[0].split(' ');
          if (yearType === 'ani') {
            rowArr.push(yearValue[1]);
          } else if (yearType === 'trimestre') {
            rowArr.push(yearValue[1]);
            rowArr.push(yearValue[2]);
          } else if (yearType === 'perioade') {
            if (yearValue.length === 2) {
              rowArr.push('anual');
              rowArr.push(yearValue[1]);
            } else {
              rowArr.push(yearValue[1]);
              rowArr.push(yearValue[2]);
            }
          } else if (yearType === 'luni') {
            rowArr.push(yearValue[1]);
            rowArr.push(yearValue[2]);
          }

          // add data item
          // const rowData = $(row).find('td');
          // let rowValue = ':';
          // let rowIndex = 0;
          $(row).find('td').each((j, value) => {
            const currRowArr = rowArr.slice(0);
            const itemValue = $(value).text().trim();
            // for each value different than ':' add new row
            if (itemValue !== ':') {
              // rowIndex = j;
              // rowValue = itemValue;
              // // push UM item
              currRowArr.push(umsColumn[j]);
              // push Value item
              currRowArr.push(itemValue);

              // add data quality item
              let dataQlty = 'definitive';
              if ($(itemValue).eq(j).has('u').length > 0) {
                // underline data stands for 'provizorii'
                dataQlty = 'provizorii';
              } else if ($(itemValue).eq(j).has('strong').length > 0) {
                // bold & underline data stands for 'semidefinitive'
                if ($(itemValue).eq(j).has('strong').has('u').length > 0) {
                  dataQlty = 'semidefinitive';
                } else {
                  // bold data stands for 'revizuite'
                  dataQlty = 'revizuite';
                }
              }
              currRowArr.push(dataQlty);

              // push new row to array
              // console.log(currRowArr);
              tableArr.push(currRowArr);
            }
          });
        });

      // return data
      console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array: ${tableType} transform finished!`);
      // console.log(returnArr);
      return { rows: tableArr, header: tableHeader, yearType };
    }

    // ////////////////////////////////////
    // if table has only two columns (UM + years)
    if (tableType === 'two-columns') {
      console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array >>>>>>> two-columns table`);
      // create header if flag is false
      if (!headerFlag) {
        $(trArray).eq(1)
          .children()
          .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });
        // console.log(tableHeader);
      }

      // reverse header ([UM, Ani] => [Ani, UM])
      tableHeader.reverse();

      // add quality header
      tableHeader.push('Calitatea datelor');

      // get year column
      const yearColumn = $(trArray)
        .filter((i, row) => $(row)
          .children().length === 1)
        .slice(1)
        .eq(0);

      const rowArr = [];

      // add year item
      const yearValue = $(yearColumn).text().trim().split(' ');
      rowArr.push(yearValue[1]);

      // add data item
      const rowData = $(trArray)
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

      // return data
      console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array: ${tableType} transform finished!`);
      // console.log(returnArr);
      return { rows: tableArr, header: tableHeader, yearType };
    }

    // ////////////////////////////////////
    // if table has multiple parents
    if (tableType === 'multiple-parents') {
      console.log('\x1b[34m%s\x1b[0m', `\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array >>>>>>> multiple-parents table`);
      // create header if flag is false
      if (!headerFlag) {
        $(trArray).eq(1)
          .children()
          .each((i, headerItem) => { tableHeader.push($(headerItem).text()); });

        // add value header
        tableHeader.push('Valoare');

        // add quality header
        tableHeader.push('Calitatea datelor');
      }

      // get year column
      const yearColumn = $(trArray)
        .filter((i, row) => $(row)
          .children().length === 1)
        .slice(1)
        .eq(0);

      // for each table row, except titles and info, parse data
      $(trArray)
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

      // return data
      console.log(`\n${tablePrefix} ${tableName} - ${progressIndex}  @html2array: ${tableType} transform finished!`);
      // console.log(tableArr);
      return { rows: tableArr, header: tableHeader, yearType };
    }
  }


  // ////////////////////////////////////
  // if none of the above options work, send empty array and header
  return { rows: tableArr, header: tableHeader, yearType };
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

  // get table details
  const { details } = arr;
  let yearKind = '';

  // iterate thru array and get the corresponding data
  let i = 0;
  let retry = false;
  let headerFlag = false;
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
    const tempData = await getData(tablePrefix, tableName, progressIndex, arr, permList[i], errorFile);
    // console.log(tempData.data);

    // check if response received contains data
    if (tempData != null) {
      const goodData = testForData(tablePrefix, tableName, progressIndex, tempData.data);
      if (goodData) {
        returnArray.push(tempData.data.resultTable);
        i += 1;

        // transform html to csv
        const tableData = html2array(tablePrefix, tableName, tableType, headerFlag, tableHeader, yearKind, details, progressIndex, tempData.data);
        // test if html transform returns data
        if (tableData.rows.length > 0) {
          console.log(`${tablePrefix} ${tableName} - ${progressIndex}  @getTableData: save to CSV file >>>>>>>`);
          // if necessary, save header to file
          if (!headerFlag) {
            headerFlag = true;
            tableHeader = tableData.header;
            file.write(`${tableHeader.join(';')}\n`);
            yearKind = tableData.yearType;
          }
          // save data to file
          tableData.rows.forEach((row) => { file.write(`"${row.join('";"')}"\n`); });
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
  // update limit
  const newLimit = Math.floor(queryLimit / umColumn.length);
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
    const { permutations, tableType } = buildPermutations(columns, newLimit);
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
async function getTable(dbStartTime, dbStartDate, tableId) {
  // test if log files exist, else create them and determine index
  let programIndex = 0;
  while (true) {
    // test if file exists
    if (fs.existsSync(`${logOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`) || fs.existsSync(`${logOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`)) {
      programIndex += 1;
    } else {
      // create CSV log files to lock programIndex
      fs.writeFileSync(`${logOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`);
      fs.writeFileSync(`${logOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`);
      break;
    }
  }

  const durationArr = [];

  // read table ancestors from file
  const tempoL1 = readFile(tempoL1File);
  const ancestors = tempoL1.level1;

  // read table headers from file
  const tempoL3 = readFile(tempoL3File);

  // open log to save table errors
  const errorFile = fs.createWriteStream(`${logOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`);
  errorFile.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', 'ERROR Log file started >>');
    console.log(err);
  });
  const logErrorHeader = ['tablePrefix', 'tableName', 'progressIndex', 'process', 'message'];
  errorFile.write(`${logErrorHeader.join(';')}\n`);

  // open log to save tables completed and times
  const logFile = fs.createWriteStream(`${logOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`);
  logFile.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', 'TABLES Log file started >>');
    console.log(err);
  });
  const logTablesHeader = ['prefix', 'tableName', 'startTime', 'finishTime'];
  logFile.write(`${logTablesHeader.join(';')}\n`);

  // get table header from
  const headersSize = tempoL3.level3.length;
  console.log('\x1b[32m%s\x1b[0m', `\n@downloadDB:: total Headers = ${headersSize}`);
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
    const fileName = `????-??-??_${tablePrefix}_${tableName}.csv`;

    // test if file exists
    if (glob.sync(fileName, { cwd: csvOutputPath }).length > 0) {
      console.log('\x1b[32m%s\x1b[0m', `\n${tablePrefix} ${tableName} @downloadDB:: file already exists, next table ...`);
    } else {
      // create CSV file to stop other processes from working on it
      fs.writeFileSync(`${csvOutputPath}/${currentDate}_${tablePrefix}_${tableName}.csv`, '', 'utf8');
      // get table index in header array
      const headerIndex = tempoL3.level3.findIndex(item => item.tableName === tableId);
      console.log('\x1b[32m%s\x1b[0m', `\n@downloadDB:: table ${tableId} has index ${headerIndex}/${headersSize - 1} in headers table`);
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
function getTables(dbStartTime, dbStartDate, tableArray = []) {
  // test if log files exist, else create them and determine index
  let programIndex = 0;
  while (true) {
    // test if file exists
    if (fs.existsSync(`${logOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`) || fs.existsSync(`${logOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`)) {
      programIndex += 1;
    } else {
      // create CSV log files to lock programIndex
      fs.writeFileSync(`${logOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`);
      fs.writeFileSync(`${logOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`);
      break;
    }
  }

  const durationArr = [];

  // read table ancestors from file
  const tempoL1 = readFile(tempoL1File);
  const ancestors = tempoL1.level1;

  // read table headers from file
  const tempoL3 = readFile(tempoL3File);

  // open log to save table errors
  const errorFile = fs.createWriteStream(`${logOutputPath}/${dbStartDate}__log_errors_${programIndex}.csv`);
  errorFile.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', 'ERROR Log file started >>');
    console.log(err);
  });
  const logErrorHeader = ['tablePrefix', 'tableName', 'progressIndex', 'process', 'message'];
  errorFile.write(`${logErrorHeader.join(';')}\n`);

  // open log to save tables completed and times
  const logFile = fs.createWriteStream(`${logOutputPath}/${dbStartDate}__log_tables_${programIndex}.csv`);
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
    tempoL3.level3.slice(900, 1000),
    tempoL3.level3.slice(1000, 1100),
    tempoL3.level3.slice(1100, 1200),
    tempoL3.level3.slice(1200, 1300),
    tempoL3.level3.slice(1300),
  ];

  // if no table array is provided, get all tables, in batches
  if (tableArray.length === 0) {
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
        const fileName = `????-??-??_${tablePrefix}_${tableName}.csv`;

        // test if file exists
        if (glob.sync(fileName, { cwd: csvOutputPath }).length > 0) {
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

    // if table array is provided, get all tables from array
  } else {
    // for each table header get table data
    tableArray.forEach(async (tableId) => {
      // get table header
      const tablesList = tempoL3.level3.filter(item => item.tableName === tableId);
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
      // const filePath = `${csvOutputPath}/${currentDate}_${tablePrefix}_${tableName}.csv`;
      const fileName = `????-??-??_${tablePrefix}_${tableName}.csv`;

      // test if file exists
      if (glob.sync(fileName, { cwd: csvOutputPath }).length > 0) {
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
      }
      // end for loop
    });
  }
}


// ///////////////////////////////////////////////////////////////////////////////////////
// // check logs for unfinished tables
function checkLogs() {
  // read table headers from file
  const tempoL3 = readFile(tempoL3File);
  const headersSize = tempoL3.level3.length;
  console.log('\x1b[32m%s\x1b[0m', `\n@downloadDB:: total Headers = ${headersSize}`);
  const tablesList = tempoL3.level3.map(item => item.tableName);
  // console.log(tablesList);

  // read tables ids from logs
  const fileName = '????-??-??__log_tables_*.csv';
  const logsArray = glob.sync(fileName, { cwd: logOutputPath });
  // console.log(logsArray);

  // create finished tables array
  const finishedArr = [];

  // create unfinished tables array
  const unfinishedArr = [];

  console.log('\x1b[34m%s\x1b[0m', '\nFound log files:');
  // for each file in array of logs
  logsArray.forEach((item) => {
    // read csv file to array
    console.log(`${item}`);
    const logFile = fs.readFileSync(`${logOutputPath}${item}`).toString().split('\n');
    // remove column header
    logFile.shift();
    // for each row in array
    logFile.forEach((row) => {
      const rowArr = row.split(';');
      if (!finishedArr.includes(rowArr[1])) finishedArr.push(rowArr[1]);
    });
  });
  // print the finished tables array
  // console.log(finishedArr.length);

  // get the unfinished tables array
  tablesList.forEach((item) => {
    if (!finishedArr.includes(item)) unfinishedArr.push(item);
  });
  // print the unfinished tables array
  console.log('\x1b[32m%s\x1b[0m', '\nUnfinished tables: ');
  console.log(unfinishedArr);
}


// ///////////////////////////////////////////////////////////////////////////////////////
// // remove tables

function removeTables(dbStartTime, dbStartDate, removeArray) {
  // for each table ID in array, get all filenames in CSV folder
  removeArray.forEach((tableId) => {
    const fileName = `????-??-??_*_${tableId}.csv`;
    const filesArray = glob.sync(fileName, { cwd: csvOutputPath });
    console.log(`files for table ID = ${tableId}`);
    console.log(filesArray);

    // for each filename in filesArray, remove file
    filesArray.forEach((fName) => {
      fs.unlinkSync(`${csvOutputPath}${fName}`);
      console.log(`Table ${tableId} deleted !`);
    });
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
  const argument = process.argv[2] || '';
  console.log('\x1b[34m%s\x1b[0m', `\n@downloadDB >>>>>>> ${argument}`);

  // create test array
  const testArray = [
    'POP105A', // regular table
    'JUS101A', // two-columns table
    'INT109A', // multiple-parents table + multiple UM
    'POP108D', // very large table
    'GOS109A', // needs 'total' column
    'ART103B', // one-parent table
    'GOS108B', // separate UM column
    'CON106A', // yearType === 'Trimestre'
    'PPA101A', // multiple UM, one choice
    'EXP101A', // multiple UM, all valid
  ];

  // if argument is 't' or 'test', download test tables
  if (argument === '-t' || argument === '--test') {
    getTables(dbStartTime, dbStartDate, testArray);

    // else if argument is 'tl' or 'testluni', check which tables have 'luni' for time column
  } else if (argument === '-tl' || argument === '--testluni') {
    // read table headers from file
    const tempoL3 = readFile(tempoL3File);

    // get all table IDs with 'luni' for time column
    const headersArray = tempoL3.level3.filter((item) => {
      const luniArr = item.dimensionsMap.filter(column => column.label.toLowerCase() === 'luni');
      return luniArr.length > 0;
    });
    console.log(headersArray.length);
    const removeArray = headersArray.map(item => item.tableName);

    // remove tables
    removeTables(dbStartTime, dbStartDate, removeArray);

    // else if argument is 'c' or 'check', check which tables are not in file logs / are unsuccessful
  } else if (argument === '-c' || argument === '--check') {
    checkLogs();

    // else if argument is not '', download table with given name
  } else if (argument !== '') {
    getTable(dbStartTime, dbStartDate, argument);

    // else, download all tables
  } else {
    getTables(dbStartTime, dbStartDate);
  }


  // end timer
  // const dbDuration = new Date() - dbStartTime;
  // console.info('\x1b[33m%s\x1b[0m', `\nDB execution time: ${Math.floor(dbDuration / 1000)}s`);
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN

downloadDB();
