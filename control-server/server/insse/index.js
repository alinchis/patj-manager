'use strict';

// import libraries
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import sequelize from 'sequelize';
import http from 'http';
// import axios from 'axios';

// import controllers


///////////////////////////////////////////////////////////////////////////////
/// declare functions
export default {


// create latex file for given UAT code_siruta
async readLevel2: function (req, res) {
	console.log('@INSSE:: axios', req);
	// await http.get('http://statistici.insse.ro:8077/tempo-ins/context/')
	// .then( (response) => {
	// 	// readArr = JSON.stringify(response);
	// 	console.log(response);
	// 	res.status(200).send({
	// 		success: true,
  //     message: response
	// 	})
	// })
	// .catch( (err) => {
	// 	console.log(err);
	// 	res.status(200).send({
	// 		success: false,
  //     message: err
	// 	})
	// });
	res.send('INSSE Tempo API');
}
	// var readArr = {};

	// read file into array
	// get Level 2 data from INSSE Tempo server
	// console.log('@INSSE:: axios');
	// Axios.get('http://statistici.insse.ro:8077/tempo-ins/context/')
	// .then( (response) => {
	// 	// readArr = JSON.stringify(response);
	// 	console.log(response);
	// })
	// .catch((error) => console.log(error))

};
