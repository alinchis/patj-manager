'use strict';

// import libraries
import fs from 'fs';
import path from 'path';
import sequelize from 'sequelize';

// csv library
import parse from 'csv-parse';

// import controllers
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';


// upload data to DB
exports.uploadData = function () {
	// upload Regions
	console.log('Starting DB upload: Regions...');
	const input = fs.createReadStream('./server/dbinit/csv/siruta-regions.csv')
	const records = parse(input, {
		delimiter: ';',
		columns: true,
		skip_empty_lines: true
	})
	.on('readable', function(csvrow) {
		// console.log(csvrow);
		// upload to PostgreSQL DB
		Regions.add(csvrow);
	})
	.on('error', function(err){
	  console.error(err.message)
	})
	.on('end', function() {
		// //on finish
		console.log('UPLOAD 1/3 finished successfully: Regions!');
		console.log('Starting DB upload: Counties...');
		// // upload Counties
		// fs.createReadStream('./server/dbinit/csv/siruta-counties.csv')
		// .pipe(parse({
		// 	delimiter: ';',
		// 	columns: true
		// }))
		// .on('data', function(csvrow) {
		// 	// console.log(csvrow);
		// 	// upload to PostgreSQL DB
		// 	Counties.add(csvrow);
		// })
		// .on('finish', function() {
		// 	// on finish
		// 	console.log('UPLOAD 2/3 finished successfully: Counties!');
		// 	console.log('Starting DB upload: Localities...');
		// 	// upload Localities
		// 	fs.createReadStream('./server/dbinit/csv/siruta-localities.csv')
		// 	.pipe(parse({
		// 		delimiter: ';',
		// 		columns: true
		// 	}))
		// 	.on('data', function(csvrow) {
		// 		// console.log(csvrow);
		// 		// upload to PostgreSQL DB
		// 		Localities.add(csvrow);
		// 	})
		// 	.on('finish', function() {
		// 		// on finish
		// 		console.log('UPLOAD 3/3 finished successfully: Localities!');
		// 	});
		// });
	});
};
