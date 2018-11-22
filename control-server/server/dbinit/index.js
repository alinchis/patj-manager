'use strict';

// import libraries
import fs from 'fs';
import path from 'path';
import sequelize from 'sequelize';


// import controllers
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';
import POP_dom_SV_107Ds from '../controllers/pop_dom_sv_107d';

/// create upload function
function uploadTable(table, table_name) {
	console.log('Starting DB upload: ' + table_name + ' ...');
	fs.readFileSync('./server/dbinit/csv/' + table_name +'.csv')
	.toString()
	.split('\n')
	.forEach(
		function (line, index) {
			if (line != '' && index > 0) {
				const arr = line.split(';');
				// console.log(arr);
				table.add(arr);
			}
		}
	);
};


///////////////////////////////////////////////////////////////////////////////
/// upload data to DB
exports.uploadData = function () {
	// upload Regions
	// uploadTable(Regions, 'siruta-regions');
	// upload Counties
	// uploadTable(Counties, 'siruta-counties');
	// upload Localities
	// uploadTable(Localities, 'siruta-localities');
	// upload Population
	uploadTable(POP_dom_SV_107Ds, 'pop_dom_sv_107d')

};
