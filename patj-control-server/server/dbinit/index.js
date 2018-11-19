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
	fs.createReadStream('./server/dbinit/csv/siruta-regions.csv')
	.pipe(parse({
		delimiter: ';',
		columns: true
	}))
	.on('data', function(csvrow) {
		// console.log(csvrow);
		// upload to PostgreSQL DB
		Regions.add(csvrow);
	})
	.on('end',function() {
		//do something wiht csvData
		console.log('Import 1/3 finished successfully: Regions!');
	});

	// upload Counties
	fs.createReadStream('./server/dbinit/csv/siruta-counties.csv')
	.pipe(parse({
		delimiter: ';',
		columns: true
	}))
	.on('data', function(csvrow) {
		// console.log(csvrow);
		// upload to PostgreSQL DB
		Counties.add(csvrow);
	})
	.on('end',function() {
		console.log('Import 2/3 finished successfully: Counties!');
	});

	// upload Localities
	fs.createReadStream('./server/dbinit/csv/siruta-localities.csv')
	.pipe(parse({
		delimiter: ';',
		columns: true
	}))
	.on('data', function(csvrow) {
		// console.log(csvrow);
		// upload to PostgreSQL DB
		Localities.add(csvrow);
	})
	.on('end',function() {
		console.log('Import 3/3 finished successfully: Localities!');
	});
};
