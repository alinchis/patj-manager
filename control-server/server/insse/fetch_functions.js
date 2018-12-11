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
const outputPath = '../../../docker-data/control/insse/csv';
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
		// console.log('@groupColumnItems: workColumn with dependency:');
		// console.log(workColumn[0]);
		newParentId = workColumn[0].parentId;
		// console.log(`newParentId = ${newParentId}`);
		// create array of Children by grouping items with same parrent
		while (workColumn.length > 0) {
			// console.log('inside dependency loop !!');
			// console.log(workColumn[0]);
			const searchId = workColumn[0].parentId;
			returnArr.type = 'child';
			returnArr.values.push(workColumn.filter(item => item.parentId === searchId));
			workColumn = workColumn.filter(item => item.parentId !== searchId);
			// check max length of elements and update limit
			// const maxLength = returnArr.values.reduce((acc, val) => {
			// 	const result = (acc.length === undefined || val > acc.length) ? val : acc.length;
			// 	return result;
			// }, []);
			// newLimit = Math.floor(limit / maxLength);
		}
		// console.log('return Array >>>>>>>>> ');
		// console.log(returnArr.values[returnArr.values.length - 1]);

		// check max length of elements and update limit (I presuppose: limit is always larger than child arrays)
		// console.log(returnArr.values);
		const lenghtsArr = returnArr.values.map(item => item.length);
		// console.log(lenghtsArr);
		newLimit = Math.floor(limit / Math.max(...lenghtsArr));
		// console.log(newLimit);
		// console.log(`new limit = ${newLimit}`);

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
		returnArr.values = [workColumn];
		newLimit = Math.floor(limit / column.length);
	} else if (limit < column.length) {
		console.log('\x1b[36m%s\x1b[0m', '@group:: limit < column.length branch');
		for (let i = 0, j = workColumn.length; i < j; i += limit) {
			returnArr.values.push(workColumn.splice(0, limit));
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
function getData(arr, permList) {
	console.log('\x1b[34m%s\x1b[0m', '@getData >>>>>>>');
	const { tableName } = arr;
	const reqPath = requestPath + tableName;

	// console.log('@getData::request path: ', reqPath);
	const postBody = createPostBody(arr, permList);
	// console.log('@getData:: postBody: ', postBody);
	return axios.post(reqPath, postBody)
		.catch(err => console.log(err.data));
}


// test if response string returns data
function testForData(responseData) {
	const testString1 = 'Rezultatul solicitat nu poate fi returnat.';
	const testString2 = 'Cautarea dvs nu a returnat nici un rezultat.';

	// parse html string and remove '\n' substring
	const htmlTable = responseData.resultTable.replace(/\\n/g, '');
	const $ = cheerio.load(htmlTable);

	// get all text
	const textContent = $('.tempoResults').text();
	// test if text containes any of the substrings
	const test = textContent.includes(testString1) || textContent.includes(testString2);

	// display outcome
	if (test) {
		console.log('\x1b[31m%s\x1b[0m', '\n@testForData >>>>>>> NOT OK !!! - retry');
	} else {
		console.log('\x1b[32m%s\x1b[0m', '\n@testForData >>>>>>> OK !!!');
	}

	// return result
	return !test;
}


// download table for query array
async function getTableData(arr, permList) {
	console.log('\x1b[34m%s\x1b[0m', '\n@getTableData >>>>>>>');

	const returnArray = [];

	// iterate thru array and get the corresponding data
	for (let i = 0; i < permList.length; i += 1) {
		// progress indicator
		console.log(`@getTableData: query - ${i}/${permList.length - 1}`);

		// get data
		const tempData = await getData(arr, permList[i]);
		// console.log('@getTableData::getData - tempData.data', tempData.data.resultTable);
		
		// check if response received contains data
		const goodData = testForData(tempData.data);
		if (!goodData) {
			i -= 1;
		} else {
			returnArray.push(tempData.data);
		}
	}

	// return unprocessed received data
	return returnArray;
}


// transform html table to array
function transformHtmlTable(inputArr) {
	console.log('\x1b[34m%s\x1b[0m', '\n@transformHtmlTable >>>>>>>');

	let returnArr = [];
	const tableHeader = [];

	// parse all query arrays
	inputArr.forEach((item) => {
		const tableArr = [];
		const htmlTable = item.resultTable.replace(/\\n/g, '');
		// console.log(htmlTable);
		const $ = cheerio.load(htmlTable);
		const test = $('.tempoResults').find('tr').length;
		console.log('@transformHtmlTable:lenght >>> ', test);

		// create header, if needed
		if (tableHeader.length === 0) {
			$('tr').eq(1)
				.children()
				.each((i, headerItem) => { tableHeader.push($(headerItem).text()); });
			const umColumn = $('tr')
				.filter((i, row) => $(row)
					.children().length === 1)
				.slice(1)
				.eq(1);
			tableHeader.push($(umColumn).text().trim());

			// add quality header
			tableHeader.push('Calitatea datelor');
		}

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
							// console.log('@bulid:: get element');
							// console.log(tableArr[tableArr.length - 1]);
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

		// add values to the table array
		returnArr = returnArr.concat(tableArr);
	});

	// add header
	returnArr.splice(0, 0, tableHeader);

	// return new array
	console.log('@transformHtmlTable::returnArr >>> ');
	// console.log(returnArr);
	return returnArr;
}


// download table from DB
async function downloadTable(item) {
	console.log('\x1b[34m%s\x1b[0m', '\n@downloadTable >>>>>>>');
	
	let outputData = [];

	// create the columns table containing all columns with all options
	const columns = item.dimensionsMap.map(column => column.options);
	// console.log('@columns::cellscount: ', cellCount(columns));
	// console.log('@columns::stepCount: ', stepCount(columns));
	console.log('@downloadTable::Columns >>> ', columns.length);
	const { tableName } = item;
	console.log('@downloadTable::Table Name >>> ', tableName);

	// remove UM column
	const umColumn = columns.pop();
	// remove Years column
	const yearsColumn = columns.pop();

	// calculate permutations for the remanining columns
	const builtArrays = buildPermutations(columns, queryLimit);

	// create the query arrays
	const queryArrays = [];
	yearsColumn.forEach((year) => {
		builtArrays.forEach((perm) => {
			queryArrays.push([...perm, [year], umColumn]);
		});
	});
	// console.log('@downloadTable::queryArrays');
	// console.log(queryArrays[0]);

	// request data
	const returnArray = await getTableData(item, queryArrays);
	// const returnArray = await Promise.all(queryArrays.map(async permutation => getData(item, permutation)
	// 	.catch(err => console.log(err))));

	console.log('@downloadTable::returnArray.length >> ', returnArray.length);

	// check if returned returnArray has values
	let success = true;
	if (returnArray.length === 0 || !returnArray) success = false;

	// transform html table to regular array
	outputData = transformHtmlTable(returnArray);
	console.log('@downloadTable:: after transform HTML');
	// console.log(outputData);

	// return table
	return { outputData, success };
}


// write table data to CSV file
function saveCSV(tableData, tableName) {
	console.log('\x1b[34m%s\x1b[0m', `\n@saveCSV::Write data to table: ${tableName}`);

	const now = new Date();
	const currentDate = dateFormat(now, 'isoDate');

	// write table to file
	const file = fs.createWriteStream(`${outputPath}/${currentDate}_${tableName}.csv`);
	file.on('error', (err) => { console.log('@saveCSV::ERROR: writing CSV file >> ', err); });
	tableData.forEach((row) => { file.write(`${row.join(';')}\n`); });
	file.end();
	console.log(`@saveCSV::Done - Table ${tableName}`);
}


// // download DataBase data from INSSE
async function downloadDB(fPath) {
	console.log('\x1b[34m%s\x1b[0m', '\n@downloadDB >>>>>>>');

	const durationArr = [];

	// start timer
	const dbStartTime = new Date();
	console.log('\x1b[33m%s\x1b[0m', '@downloadDB:: Timer started\n');

	// read table headers from file
	const tempoL3 = readFile(fPath);

	// for each table header get table data
	for (element of tempoL3.level3.slice(4, 5)) {
		// start timer
		const tableStartTime = new Date();

		// download table drom DB
		try {
			const { outputData, success } = await downloadTable(element);
			const { tableName } = element;

			// check is table retrieval was successful and write it to file
			if (success) {
				console.log('\x1b[32m%s\x1b[0m', `@downloadDB::downloadTable - Table ${tableName} : SUCCESSFUL!!!`);
				// console.log(outputData);
				// write table to CSV file
				saveCSV(outputData, tableName);
			} else {
				console.log('\x1b[31m%s\x1b[0m', `@downloadDB::downloadTable - Table ${tableName} : UNSUCCESSFUL!!!`);
			}
		} catch (err) { console.log(err); }

		// print execution time for table
		const tableDuration = new Date() - tableStartTime;
		durationArr.push(tableDuration);
		console.info('\x1b[33m%s\x1b[0m', `Table execution time: ${Math.floor(tableDuration / 1000)}s`);

		const passedTime = new Date() - dbStartTime;
		console.info('\x1b[33m%s\x1b[0m', `Elapsed execution time: ${Math.floor(passedTime / 1000)}s`);

	}

	// end timer
	const dbDuration = new Date() - dbStartTime;
	console.info('\x1b[33m%s\x1b[0m', `DB execution time: ${Math.floor(dbDuration / 1000)}s`);
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN

downloadDB(tempoL3File);
