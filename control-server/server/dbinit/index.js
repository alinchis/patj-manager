// dbinit/index.js

// import libraries
import fs from 'fs';
// import path from 'path';
// import sequelize from 'sequelize';


// import controllers
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';
import POP_dom_SV_107Ds from '../controllers/pop_dom_sv_107d';


// cleat Table data
function clearTableData(table) {
	return new Promise((resolve, reject) => {
		const rows = table.clear();
		resolve(rows);
	});
}


// upload Table data
function uploadTable(table, tableName) {
	return new Promise.all((resolve, reject) => {
		const arr = [];
		let checkflag = false;
		const filePath = `../control-data/siruta/${tableName}.csv`;
		console.log(filePath);
		fs.readFileSync(filePath)
			.toString()
			.split('\n')
			.map((line, index) => {
				// avoid empty lines and header
				if (line !== '' && index > 0) {
					const record = line.split(';');
					console.log(record);
					arr.push(record);
					if (table.add(record) !== true) checkflag = true;
				}
			});
		if (!checkflag) {
			resolve(arr.length);
		} else {
			reject(Error(`Table: ${tableName} upload error!`));
		}
	});
}

// create upload function
async function uploadData(req, res) {
	console.log('STARTED DB init upload ...');
	// clear SIRUTA Tables
	// const localitiesClear = await clearTableData(Localities);
	// console.log(`Localities Table cleared: ${localitiesClear} rows`);
	// const countiesClear = await clearTableData(Counties);
	// console.log(`Counties Table cleared: ${countiesClear} rows`);
	// const regionsClear = await clearTableData(Regions);
	// console.log(`Regions Table cleared: ${regionsClear} rows`);
	// upload Rogions data
	const regions = await uploadTable(Regions, 'siruta-regions');
	// upload Counties data
	// const counties = await uploadTable(Counties, 'siruta-counties');
	// // upload Localities data
	// const localities = await uploadTable(Localities, 'siruta-localities');
	// return
	return res.send({
		success: true,
		message: 'Data uploaded to DB',
		// cleared: [regionsClear, countiesClear, localitiesClear],
		data: [regions],
	});
}


module.exports = uploadData;
