
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

// create path to latex template file
const latexPath = '../../../docker-data/control/latex/';


// ////////////////////////////////////////////////////////////////////////////
// METHODS

// GET: UAT data from DB
async function getUATData(siruta) {
	// get UAT general data from siruta table
	const [uat, locList] = await Promise.all([
		Localities.dbGetLocalUAT(siruta),
		Localities.dbGetLocalUATList(siruta),
	]);

	return { info: uat[0], localities: locList[0] };
}

// READ: LaTeX template file into array
function readTemplate() {
	const templatePath = `${latexPath}template.tex`;
	return fs.readFileSync(templatePath)
		.toString()
		.split('\n');
}

// EXTRACT: LaTeX placeholder array
function createPhArr(list) {
	return new Promise.all((resolve, reject) => {
		const newList = [];
		list.forEach((item, index) => {
			if(item.includes('%db.')) {
				const value = item.replace(/^%db./, '').replace(/%$/, '');
				newList.push({ item: value, arrIndex: index });
			}
		});
		if (!newList.length > 0) {
			resolve(newList);
		} else {
			reject(Error('Returned list is empty!'));
		}
	});
}

// CREATE helper: LaTeX list
function texList(arr) {
	const outArr = [];

	outArr.push('\\begin{enumerate}\n');
	outArr.push('\\item testing\n');
	arr.forEach((item) => {
		const line = `\\item ${item.code_siruta} ${item.name_ro}\n`;
		// console.log('!!!!!!!!!!!!!!',line);
		outArr.push(line);
	})
	outArr.push('\\end{enumerate}\n');

	return outArr;
}

// CREATE helper: LaTeX table



// CREATE: LaTeX array
async function createTexArr(uat, placeholders, template) {
	// set some values
	const outArr = [];

	// insert title
	const titleArr = [
		`\\title{Fişa UATB ${uat.info.name_ro}}\n`,
		'\\date{\\today}\n',
		'\\maketitle\n',
	];
	outArr.concat(template.slice(0, placeholders[0].index));
	outArr.concat(titleArr);

	// insert Section 1. Date de identificare
	const listArr = texList(uat.localities);
	const infoArr = [
		`Denumire: ${uat.info.name_ro}\n`,
		`Cod SIRUTA: ${uat.info.code_siruta}\n`,
		`Rang: ${uat.info.rank}\n`,
		'Localităţi componente: \n',
	];
	infoArr.concat(listArr);

	outArr.concat(template.slice(placeholders[0].index, placeholders[1].index));
	outArr.concat(infoArr);

	// insert Section 2. Populatie la domiciliu


	// copy the rest of the template array
	outArr.concot(template.slice(placeholders[1].index, template.length));


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


// ////////////////////////////////////////////////////////////////////////////
// REQUESTS

// request pdf file for given UAT code_siruta
async function requestPdf(req, res) {
	const { sirutaUAT } = req.params;
	const inputPath = `http://latex-server:4040/static/${sirutaUAT}.pdf`;
	const outputPath = `./static/${sirutaUAT}.pdf`;

	console.log('@Latex: create Pdf > ', sirutaUAT);

	// get UAT data from DB
	const uatData = await getUATData(sirutaUAT);
	// console.log('@Latex 1: uatData > ', uatData);

	// read LaTeX template file into array
	const templateArray = readTemplate();
	console.log('@Latex 2: template > ', templateArray);

	// get the placeholders array
	const phArray = createPhArr(templateArray);
	console.log('@Latex 3: placeholder > ', phArray);

	// create LaTeX array
	const latexArray = createTexArr(uatData, phArray, templateArray);
	console.log('@Latex 4: latex > ', latexArray);

	// create LaTeX content
	const texContent = await createTexContent(latexArray);
	console.log('@Latex 5: content > ', texContent);

	// create Pdf file from content
	await axios.post('http://latex-server:4444/api/create', {
		codeSiruta: sirutaUAT,
		content: texContent,
	})
		.then(response => console.log(response.data))
		.catch(err => console.log(err));

	// copy Pdf file to control-server
	fs.copyFile(inputPath, outputPath, (err) => {
		if (err) throw err;
		console.log('@Latex 6: Pdf file ready');
	  });
	// const input = fs.createReadStream(inputPath);
	// console.log('@Latex: created input stream > ');
	// const output = fs.createWriteStream(outputPath);
	// console.log('@Latex: created output stream > ');

}

// delete pdf && latex file for given UAT code_siruta
function removePdf(req, res) {
	const { sirutaUAT } = req.params;
	const pdfPath = path.join('./static/', sirutaUAT, '.pdf');

	console.log('@Latex: delete Pdf > ', sirutaUAT);
	// delete pdf file
	fs.unlink(pdfPath, (err) => {
	  if (err) throw err;
	  console.log('@Latex: deleted Pdf');
		return res.status(201).send({
	    message: `Pdf file for UAT with siruta ${sirutaUAT} has been deleted `,
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
