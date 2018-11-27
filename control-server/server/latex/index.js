
// import libraries
import fs from 'fs';
import readline from 'readline';
import path from 'path';
// import sequelize from 'sequelize';

// import controllers
// import Regions from '../controllers/ro_siruta_region';
// import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';
// import Population from '../controllers/pop_dom_sv_107d';


// ////////////////////////////////////////////////////////////////////////////
// METHODS

// CREATE Latex Table from array
function createLatexTable(readArr) {
	const writeArr = [];

	return writeArr;
}

// EXTRACT: LaTeX placeholder array
function createPlaceholderArr(list) {
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

// // CREATE: latex file for given UAT code_siruta
async function createTexArr(code_siruta) {
	// set some values
	const readPath = path.join(__dirname, '/template.tex');
	let readArr = [];
	const writeArr = [];
	let placeholderArr = [];
	let arrFlag = true;
	let i = 0;

	// // GET: UAT data from DB
	const uat = await Localities.getLocalUAT(code_siruta);
	// get UAT list of components for given code_siruta
	const locList = await Localities.getLocalUATList(code_siruta);
	// console.log('UAT list: ', locList);

	// // CREATE: LaTeX Template array
	readArr = fs.readFileSync(readPath)
	.toString()
	.split('\n');

	// // EXTRACT: LaTeX placeholher array
	placeholderArr = await createPlaceholderArr(readArr);


	// // CREATE: LaTeX UAT array
	while (arrFlag && i < readArr.length) {
		if (readArr[i].includes('%db.title%')) {
			const title = `\\title{Fişa UATB ${uat.name_ro}}`;
			writeArr.push(title);
			writeArr.push('\\date{\\today}');
			writeArr.push('\\maketitle');
			arrFlag = false;
		} else {
			writeArr.push(readArr[i]);
		}
		i += 1;
	}

	// insert Section 1. Date de identificare
	arrFlag = true;
	while (arrFlag && i < readArr.length) {
		if (readArr[i].includes('%db.section.info%')) {
			const name_ro = `Denumire: ${uat.name_ro}\n`;
			const locList = 'Localităţi componente: \n';
			const code_siruta = `Cod SIRUTA: ${uat.code_siruta}\n`;
			const rank = `Rang: ${uat.rank}\n`;

			writeArr.push(name_ro);
			// insert UAT localities list
			writeArr.push(locList);
			writeArr.push('\\begin{enumerate}\n');
			writeArr.push('\\item testing\n');
			// for (let item in locList) {
			// 	const line = '\\item ' + item.code_siruta + ' ' + item.name_ro + '\n';
			// 	console.log('!!!!!!!!!!!!!!',line);
			// 	writeArr.push(line);
			// };
			writeArr.push('\\end{enumerate}\n');
			writeArr.push(code_siruta);
			writeArr.push(rank);

			arrFlag = false;
		} else {
			writeArr.push(readArr[i]);
		}
		i += 1;
	}



	// insert Section 2. Populatie la domiciliu

	// copy remaining text
	while (i < readArr.length) {
		writeArr.push(readArr[i]);
		i += 1;
	}

	// return LaTeX UAT array
	return writeArr;
}

// // CREATE Pdf file
function createPdf(sirutaUAT) {
	// create corresponding latex file
	return createTexArr(sirutaUAT);
}


// ////////////////////////////////////////////////////////////////////////////
// REQUESTS

// request pdf file for given UAT code_siruta
async function requestPdf(req, res) {
	const { sirutaUAT } = req.params;
	const latexPath = path.join(__dirname, '/temp/', sirutaUAT, '.tex');
	const pdfPath = path.join('./static/', sirutaUAT, '.pdf');

	console.log('@Latex: create Pdf > ', sirutaUAT);

	// create corresponding latex file
	await createPdf(sirutaUAT);


	const input = fs.createReadStream(latexPath);
	console.log('@Latex: created input stream > ');
	const output = fs.createWriteStream(pdfPath);
	console.log('@Latex: created output stream > ');
	const pdf = latex(input);
	console.log('@Latex: bind > ');

	pdf.pipe(output);
	pdf.on('error', (err) => {
		console.error(err);
		return res.status(201).send({
	    message: 'Pdf file creation error!',
	    pdfPath,
	  });
	});
	pdf.on('end', () => {
	  console.log('@Latex: Pdf file done!');
		return res.status(201).send({
	    message: `Pdf file for UAT with siruta ${sirutaUAT} has been created successfully `,
	    pdfPath,
		});
  });
}

// delete pdf && latex file for given UAT code_siruta
function removePdf(req, res) {
	const { sirutaUAT } = req.params;
	const pdfPath = path.join('./static/', sirutaUAT, '.pdf');
	const latexPath = path.join(__dirname, '/temp/', sirutaUAT, '.tex');

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

	// delete latex file
	fs.unlink(latexPath, (err) => {
	  if (err) throw err;
	  console.log('@Latex: deleted Latex');
	});
}


// /////////////////////////////////////////////////////////////////////////////
// // export module

module.exports = {
	requestPdf,
	removePdf,
};
