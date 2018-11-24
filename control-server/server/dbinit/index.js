// dbinit/index.js
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
var uploadTable = function (req, res, next) {
	// this.regions = fs.readFileSync('./server/dbinit/csv/siruta-regions.csv')
	// 	.toString()
	// 	.split('\n')
	// 	.map( (line, index) => {
	// 		// avoid empty lines and header
	// 		if (line != '' && index > 0) {
	// 			const arr = line.split(';');
	// 			// console.log(arr);
	// 			Regions.add(arr);
	// 		}
	// 	})
	// 	.then( res => res.send('Upload complete'))
	// 	.catch( err => res.send(err));
	return res.send('test db2');
};


module.exports = uploadTable;