
// import libraries
import fs from 'fs';
// import readline from 'readline';
import path from 'path';
// import sequelize from 'sequelize';
import axios from 'axios';

// import controllers
// import Regions from '../controllers/ro_siruta_region';
// import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';
// import Population from '../controllers/pop_dom_sv_107d';

// create path to latex template file (only available on server)
const latexPath = '../control-data/latex/';


// ////////////////////////////////////////////////////////////////////////////
// METHODS

// GET: UAT data from DB
async function getUATData(siruta) {
	// get UAT general data from siruta table
	const [uat, locList] = await Promise.all([
		Localities.dbGetLocalUAT(siruta),
		Localities.dbGetLocalUATList(siruta),
	]);

	return { info: uat[0], localities: locList };
}

// READ: LaTeX template file into array
function readTemplate() {
	const templatePath = `${latexPath}template.tex`;
	// console.log(`@read template: ${templatePath}`);
	if (fs.existsSync(templatePath)) {
		return fs.readFileSync(templatePath)
		.toString()
		.split('\n');
	}
	console.log('@readTemplate: File not found!');
	return '';
}

// EXTRACT: LaTeX placeholder array
function createPHArr(list) {
	const filterArr = list.filter(item => item.includes('%db.'));
	return filterArr.map((value) => {
		const newValue = value.replace(/^%db./, '').replace(/%$/, '');
		const position = list.indexOf(value);
		return { name: newValue, index: position };
	});
}

// CREATE helper: LaTeX list
function texList(arr) {
	const outArr = [];

	outArr.push('\\begin{enumerate}\n');
	arr.forEach((item) => {
		const line = `\\item ${item.code_siruta} ${item.name_ro}\n`;
		outArr.push(line);
	})
	outArr.push('\\end{enumerate}\n');

	return outArr;
}

// CREATE helper: LaTeX table



// CREATE: LaTeX array
function createTexArr(uat, placeholders, template) {
	// set some values
	let outArr = [];

	// insert title
	const titleArr = [
		`\\title{Fişa UATB ${uat.info.name_ro}}\n`,
		'\\date{\\today}\n',
		'\\maketitle\n',
	];

	outArr = outArr.concat(template.slice(0, placeholders[0].index));
	outArr = outArr.concat(titleArr);

	// insert Section 1. Date de identificare
	const listArr = texList(uat.localities);
	let infoArr = [
		`Denumire: ${uat.info.name_ro}\n`,
		`Cod SIRUTA: ${uat.info.code_siruta}\n`,
		`Rang: ${uat.info.rank}\n`,
		'Localităţi componente: \n',
	];
	infoArr = infoArr.concat(listArr);

	outArr = outArr.concat(template.slice(placeholders[0].index, placeholders[1].index));
	outArr = outArr.concat(infoArr);

	// insert Section 2. Populatie la domiciliu


	// copy the rest of the template array
	outArr = outArr.concat(template.slice(placeholders[1].index, template.length));


	// return LaTeX UAT array
	return outArr;
}

// CREATE: LaTeX content string
function createTexContent(texArr) {
	let contentStr = '';
	// convert array to string, also adding '\n' character after each line
	texArr.forEach((item) => { contentStr += `${item}\n`; });
	return contentStr;
}

// CREATE: Pdf file
// async function createPdf(siruta, text) {
// 	const filePath = `http//latex-server:4444/static/${siruta}.pdf`;
// 	return new Promise(async (resolve, reject) => {
// 		const res = await axios.post('http://latex-server:4040/api/create', {
// 			codeSiruta: siruta,
// 			content: text,
// 		})
// 			.catch(err => console.log(err));

// 		console.log('@file path: ', filePath);
// 		console.log(`@file input test: ${fs.existsSync(filePath)}`);
// 		resolve();
// 	});
// }

async function createPdf(siruta, text) {
	const fileUrl = `http://latex-server:4040/static/${siruta}.pdf`;
	
	const res = await axios.post('http://latex-server:4040/api/create', {
		codeSiruta: siruta,
		content: text,
	}).catch(err => console.log(err));
	
	console.log('@file path: ', fileUrl);
	
	const response = await axios({
		method: 'GET',
		url: fileUrl,
		responseType: 'stream',
	})
	
	// pui tu aici pathul potrivit
	response.data.pipe(fs.createWriteStream(`./static/${siruta}.pdf`))
	
	// return a promise and resolve when download finishes
	return new Promise((resolve, reject) => {
		response.data.on('end', () => {
				axios.post('http://latex-server:4040/api/remove', {
					codeSiruta: siruta,
				}).catch(err => console.log(err));
			resolve(true);
		});
	});
}

// COPY: Pdf file from latex-server to control-server
// function copyPdf(inPath, outPath) {
// 	let success = false;
// 	// if file exists on latex-server, copy it
// 	return new Promise((resolve, reject) => {
// 		if (fs.existsSync(inPath)) {
// 			fs.copyFile(inPath, outPath, (err) => {
// 				if (err) throw err;
// 				console.log('@Latex 6: Pdf file ready');
// 				success = true;
// 			});
// 			resolve;
// 		} else {
// 			console.log('@Latex 6: Pdf source file not found!');
// 			reject;
// 		}
// 	});
// }


// ////////////////////////////////////////////////////////////////////////////
// REQUESTS

// request pdf file for given UAT code_siruta
async function requestPdf(req, res) {
	const { sirutaUAT } = req.params;
	const inputPath = `http//latex-server:4444/static/${sirutaUAT}.pdf`;
	const outputPath = `./static/${sirutaUAT}.pdf`;

	console.log('@Latex: create Pdf > ', sirutaUAT);

	// get UAT data from DB
	const uatData = await getUATData(sirutaUAT);
	// console.log('@Latex 1: uatData > ', uatData);

	// read LaTeX template file into array
	const templateArray = readTemplate();
	// console.log('@Latex 2: template > ', templateArray);

	// get the placeholders array (return { name:, index: })
	const phArray = createPHArr(templateArray);
	// console.log('@Latex 3: placeholder > ', phArray);

	// create LaTeX array
	const latexArray = createTexArr(uatData, phArray, templateArray);
	// console.log('@Latex 4: latex > ', latexArray);

	// create LaTeX content
	const texContent = await createTexContent(latexArray);
	// console.log('@Latex 5: content > ', texContent);

	// test latex content
	// fs.writeFileSync(`${latexPath}test.tex`, texContent);

	// create Pdf file from content
	const flag = await createPdf(sirutaUAT, texContent);

	// copy Pdf file to control-server
	// const flag = copyPdf(inputPath, outputPath);

	if (flag) {
		return res.status(201).send({
			message: `Pdf file for UAT with siruta ${sirutaUAT} has been created.`,
			data: true,
		});
	}
	res.status(404).send({
		message: `Error creating pdf file for UAT: ${sirutaUAT}!`,
		data: false,
	});
}

// delete pdf && latex file for given UAT code_siruta
function removePdf(req, res) {
	const { sirutaUAT } = req.params;
	console.log(sirutaUAT);
	const pdfPath = `./static/${sirutaUAT}.pdf`;

	console.log('@Control-server: removePdf > ', sirutaUAT);
	// delete pdf file
	fs.unlink(pdfPath, (err) => {
		if (err) {
			console.log(err);
			return res.status(404).send({
				message: 'Pdf file not found!',
				data: false,
			});
		};
	console.log('@Control-server: Pdf removed');
	return res.status(201).send({
		message: `Pdf file for UAT with siruta ${sirutaUAT} has been deleted`,
		data: true,
	});
	});
}


// /////////////////////////////////////////////////////////////////////////////
// // EXPORT module

module.exports = {
	requestPdf,
	removePdf,
};
