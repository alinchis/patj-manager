'use strict';

// import libraries
var fs = require('fs');
// import readline from 'readline';
// import path from 'path';
// import sequelize from 'sequelize';
// import http from 'http';
var axios = require('../../node_modules/axios/index');

///////////////////////////////////////////////////////////////////////////////
/// declare functions

// create latex file for given UAT code_siruta
async function readLevel2() {
	console.log('@INSSE:: axios');
	// declare variables
	const tempoL1_path = 'http://statistici.insse.ro:8077/tempo-ins/context/';
	const tempoL3_path = 'http://statistici.insse.ro:8077/tempo-ins/matrix/';
	const tempoL1_file = './tempoL1.json';
	const tempoL2_file = './tempoL2.json';
	const tempoL3_file = './tempoL3.json';
	var tempoL1 = {"level1":[]};
	var tempoL2 = {"level2":[]};
	var tempoL3 = {"level3":[]};


	//// get tempo Level 1: Chapters + Sections
	await axios.get(tempoL2_path)
	.then( (response) => {
		tempoL1.tempo = response.data;
		// console.log(tempoL2);
		fs.writeFile(tempoL1_file, JSON.stringify(tempoL1), 'utf8', () => console.log('File tempoL1.json closed'));
	})
	.catch( (err) => {
		console.log(err);
	});


	//// get tempo Level 2: Sub-Sections
	// create items list
	const l1list = tempoL1.level1.filter( (item) => item.level == 2 );
	console.log('L1 list:', l1list.length);
	// declare query function
	const getL2 = async () => {
	  await Promise.all(l1list.map(async item => {
			const tempoL2_path = tempoL1_path + item.context.code;
			// console.log(tempoL2_path)
			await axios.get(tempoL2_path)
			.then( (response) => {
				// console.log(response.data);
				tempoL2.level2.push(response.data);
				// console.log('level2ARR: ', tempoL2.level2.length);
			})
			.catch( (err) => {
				console.log(err);
			});
	    // console.log(item);
	  }));
	  console.log('Done');
		fs.writeFile(tempoL2_file, JSON.stringify(tempoL2), 'utf8', () => console.log('File tempoL2.json closed'));
	};
	// call function
	getL2();


	//// get tempo Level 3: Tables interface
	// create items list
	const l2list = [];
	tempoL2.forEach( (item) => {
		l2list = l2list.concat(item.children);
	});
	console.log('L2 list:', l2list.length);
	// declare query function
	const getL3 = async () => {
	  await Promise.all(l2list.map(async item => {
			const item_path = tempoL3_path + item.code;
			// console.log(tempoL3_path)
			await axios.get(item_path)
			.then( (response) => {
				// console.log(response.data);
				tempoL3.level3.push(response.data);
				// console.log('level3ARR: ', tempoL3.level3.length);
			})
			.catch( (err) => {
				console.log(err);
			});
	    // console.log(item);
	  }));
	  console.log('Done');
		fs.writeFile(tempoL3_file, JSON.stringify(tempoL3), 'utf8', () => console.log('File tempoL3.json closed'));
	};
	// call function
	getL3();


	//// get tempo Level 4: Tables data


}


//////////////////////////////////////////////////////////////////////////////
/// main area

readLevel2();
