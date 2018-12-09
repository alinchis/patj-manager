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
		// check and remove the first element if is 'Total'
		if (workColumn[0].parentId === workColumn[0].nomItemId) workColumn.shift();
		// set parentId as the parentId of the first element in array
		newParentId = workColumn[0].parentId;
		// create array of Children by grouping items with same parrent
		while (workColumn) {
			const searchId = workColumn[0].parentId;
			returnArr.type = 'child';
			returnArr.values.push([workColumn.filter(item => item.parentId === searchId)]);
			workColumn = workColumn.filter(item => item.parentId !== searchId);
			// check max length of elements and update limit
			const maxLength = returnArr.values.reduce((acc, val) => {
				const result = (acc.length === undefined || val > acc.length) ? val : acc.length;
				return result;
			}, []);
			newLimit = Math.floor(limit / maxLength);
		}
	} else if (parenthood) {
		returnArr.type = 'parent';
		returnArr.values = workColumn.map(item => [item]);
		// one item array does not influence the limit, return same limit
		newLimit = limit;
		// reset parentId value
		newParentId = null;
	} else if (limit === 0) {
		returnArr.values = workColumn.map(item => [item]);
	} else if (limit > column.length) {
		returnArr.values = [workColumn];
		newLimit = Math.floor(limit / column.length);
	} else if (limit < column.length) {
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
			newPermutations.push(newColumns.returnArr.values);
		} else if (newColumns.returnArr.type === 'parent') {
			newColumns.returnArr.values.forEach((item) => {
				const chlidren = permutations[permutations.length - 1].filter(child => child[0].parentId === item[0].nomItemId);
				newPermutations.push([item, ...chlidren]);
			});
		} else {
			newColumns.returnArr.values.forEach((item) => {
				permutations.forEach((elem) => {
					newPermutations.push([item, ...elem]);
				});
			});
		}
		permutations = newPermutations;
		console.log(`@build ${index}::permutations:`);
		// console.log(permutations);
	});

	// return permutations array
	return permutations;
}


// query function
async function getData(arr, permList) {
	// console.log('@getData::permList >>> ', permList);
	// return Promise.all(
	// 	permList.map(async (item) => {
			const { tableName } = arr;
			const reqPath = requestPath + tableName;
			console.log('@getData::request path: ', reqPath);
			const postBody = createPostBody(arr, permList);
			// console.log('@getData:: postBody: ', postBody);
			return axios.post(reqPath, postBody)
				.catch(err => console.log(err.data))
				.then((response) => {
					console.log('@getData::response:');
					console.log(response.data);
					return response.data;
				});
	// 	}),
	// );
}


// download table from DB
function downloadTable(item) {
	const outputData = [];

	// create the columns table containing all columns with all options
	const columns = item.dimensionsMap.map(column => column.options);
	// console.log('@columns::cellscount: ', cellCount(columns));
	// console.log('@columns::stepCount: ', stepCount(columns));
	console.log('@downloadTable::Columns >>> ', columns.length);
	const tableHeader = item.dimensionsMap.map(col => col.label);
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
	console.log('@downloadTable::queryArrays');
	// console.log(queryArrays[0]);

	// select a slice for testing purposes
	const testPerm = [queryArrays[0]];
	// testPerm.push(queryArrays.slice(0, 1));
	// console.log('@TEST queryArrays >>> ', testPerm);

	// request data
	testPerm.map(async (permutation) => {
		// const perm = permutation.map(cell => [cell]);
		// console.log('@downloadTable::map: ', permutation);
		const response = await getData(item, permutation);
		console.log('@downloadTable::response: ', response.data);

		return response.data;
	});

	// return table
	return outputData;
}


// write table data to CSV file
function saveCSV(tableData, tableName) {
	console.log(`@saveCSV::Write data to table: ${tableName}`);
	// write table to file
	const file = fs.createWriteStream(`${outputPath}/${tableName}.csv`);
	file.on('error', (err) => { console.log('@saveCSV::ERROR: writing CSV file >> ', err); });
	tableData.forEach((row) => { file.write(`${row.join(';')}\n`); });
	file.end();
}


// function check multiple MU in one table
function checkMU(arr) {
	const newArr = arr.map((item) => {
		const columns = item.dimensionsMap.map(column => column.options);
		const { tableName } = item;
		if (columns[columns.length - 1].length > 1) return { tableName, columns, multipleMU: true };
		return { tableName, columns, multipleMU: false };
	})
	return newArr;
}


// // download DataBase data from INSSE
function downloadDB(fPath) {
	// read table headers from file
	const tempoL3 = readFile(fPath);

	// check if there are multiple measure units in same table
	// not important: all items are sent to the server
	// const multipleMU = checkMU(tempoL3.level3);
	// const checkArray = multipleMU.filter(item => item.multipleMU === true);
	// console.log('@dowloadDB::multipleMU: ', checkArray);

	// for each table header get table data
	tempoL3.level3.slice(0, 1).forEach((element) => {
		// download table drom DB
		const tableData = downloadTable(element);
		// const { tableName } = element;
		// write table to CSV file
		// saveCSV(tableData, tableName);
	});
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN

downloadDB(tempoL3File);
