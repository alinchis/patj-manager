'use strict';

// import libraries
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import sequelize from 'sequelize';
import latex from 'node-latex';

// import controllers
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';
import Population from '../controllers/pop_dom_sv_107d';


///////////////////////////////////////////////////////////////////////////////
/// declare functions

// create latex file for given UAT code_siruta
async function createTex(code_siruta) {
	// set some values
	const read_path = __dirname + '/template.tex';
	const write_path = __dirname + '/temp/' + code_siruta + '.tex';
	var readArr = [];
	var writeArr = [];
	var arrFlag = true;
	var i = 0;

	// table metadata
	const pop_dom_107d_meta = {
		definitie: 'Populatia dupa domiciliu la data de 1 ianuarie a anului de referinta reprezinta numarul persoanelor cu cetatenie romana si domiciliu pe teritoriul Romaniei, delimitat dupa criterii administrativ-teritoriale. Domiciliul persoanei este adresa la care aceasta declara ca are locuinta principala, trecuta in actul de identitate (CI, BI), asa cum este luata in evidenta organelor administrative ale statului. In stabilirea valorii acestui indicator nu se tine cont de resedinta obisnuita, de perioada si\/sau motivul absentei de la domiciliu.',
		periodicitate: 'Anuala',
		metodologie: 'Metoda utilizata pentru calculul indicatorului "populatia dupa domiciliu" este metoda componentelor: a) la nivel de total tara, in functie de soldul sporului natural si soldul migratiei internationale definitive: P(t+1) = P(t) + N(t,t+1) - D(t,t+1) + dM(t,t+1) + Cv unde: P(t+1) - populatia cu domiciliul in tara la momentul t+1; P(t) - populatia cu domiciliul in tara la momentul t; N(t,t+1) - numarul de nascuti-vii in perioada (t , t+1), ai caror mame au avut domiciliul in Romania la data nasterii; D(t,t+1) - numarul de persoane care au decedat in perioada (t , t+1), care aveau domiciliul in Romania la data decesului; dM(t,t+1) - soldul migratiei internationale definitive (imigranti - emigranti), in perioada (t , t+1); Cv - coeficient de ajustare a varstelor. b) in profil teritorial, la diferite niveluri administrativ-teritoriale pentru care se calculeaza, in functie de soldul sporului natural, soldul migratiei internationale definitive si soldul migratiei interne cu schimbarea domiciliului: P(t+1) = P(t) + N(t,t+1) - D(t,t+1) + dM(t,t+1) + dm(t,t+1) + Cv unde: P(t+1) - populatia cu domiciliul in tara la momentul t+1; P(t) - populatia cu domiciliul in tara la momentul t; N(t,t+1) - numarul de nascuti-vii in perioada (t , t+1), ai caror mame au avut domiciliul in Romania la data nasterii; D(t,t+1) - numarul de persoane care au decedat in perioada (t , t+1), care aveau domiciliul in Romania la data decesului; dM(t,t+1) - soldul migratiei internationale definitive (imigranti - emigranti), in perioada (t , t+1); dm(t,t+1) - soldul migratiei interne cu schimbarea domiciliului (sositi - plecati), in perioada (t , t+1); Cv - coeficient de ajustare a varstelor. Varsta este exprimata in ani impliniti (de exemplu, o persoana avand varsta de 24 ani si 11 luni este considerata ca avand varsta de 24 ani). '
	};

	// get UAT info from DB for given code_siruta
	const uat = await Localities.getLocalUAT(code_siruta);
	// get UAT list of components for given code_siruta
	const loc_list = await Localities.getLocalUATList(code_siruta);
	console.log('UAT list: ', loc_list);

	// read file into array
	readArr = fs.readFileSync(read_path)
	.toString()
	.split('\n');

	// open write file
	var output = fs.createWriteStream(write_path);

	// insert title
	while (arrFlag && i < readArr.length) {
		if (readArr[i].includes('%db.title%')) {
			const title = '\\title{Fişa UATB ' + uat.name_ro + '}';
			writeArr.push(title);
			writeArr.push('\\date{\\today}');
			writeArr.push('\\maketitle');
			arrFlag = false;
		} else {
			writeArr.push(readArr[i]);
		};
		i++;
	};

	// insert Section 1. Date de identificare
	arrFlag = true;
	while (arrFlag && i < readArr.length) {
		if (readArr[i].includes('%db.section.info%')) {
			const name_ro = 'Denumire: ' + uat.name_ro + '\n';
			const loc_list = 'Localităţi componente: \n';
			const code_siruta = 'Cod SIRUTA: ' + uat.code_siruta + '\n';
			const rank = 'Rang: ' + uat.rank + '\n';

			writeArr.push(name_ro);
			// insert UAT localities list
			writeArr.push(loc_list);
			writeArr.push('\\begin{enumerate}\n');
			writeArr.push('\\item testing\n');
			// for (let item in loc_list) {
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
		};
		i++;
	};



	// insert Section 2. Populatie la domiciliu

	// copy remaining text
	while ( i < readArr.length) {
		writeArr.push(readArr[i])
		i++;
	};

	// write writeArr to file
	writeArr.forEach( line => output.write(line + '\n'))
	// close write file
	output.end();
}

// create pdf file for given UAT code_siruta
async function createPdf(req, res) {
	const { sirutaUAT } = req.params;
	const latex_path = __dirname + '/temp/' + sirutaUAT + '.tex';
	const pdf_path = './static/' + sirutaUAT + '.pdf';

	console.log('@Latex: create Pdf > ', sirutaUAT);

	// create corresponding latex file
	await createTex(sirutaUAT);


	const input = fs.createReadStream(latex_path);
	console.log('@Latex: created input stream > ');
	const output = fs.createWriteStream(pdf_path);
	console.log('@Latex: created output stream > ');
	const pdf = latex(input);
	console.log('@Latex: bind > ');

	pdf.pipe(output)
	pdf.on('error', err => {
		console.error(err);
		return res.status(201).send({
	    message: `Pdf file creation error!`,
	    pdf_path
	  });
	});
	pdf.on('end', () => {
	  console.log('@Latex: Pdf file done!');
		return res.status(201).send({
	    message: `Pdf file for UAT with siruta ${sirutaUAT} has been created successfully `,
	    pdf_path
		});
  });
};

// delete pdf && latex file for given UAT code_siruta
function deletePdf(req, res) {
	const { sirutaUAT } = req.params;
	const pdf_path = './static/' + sirutaUAT + '.pdf';
	const latex_path = __dirname + '/temp/' + sirutaUAT + '.tex';

	console.log('@Latex: delete Pdf > ', sirutaUAT);
	// delete pdf file
	fs.unlink(pdf_path, (err) => {
	  if (err) throw err;
	  console.log('@Latex: deleted Pdf');
		return res.status(201).send({
	    message: `Pdf file for UAT with siruta ${sirutaUAT} has been deleted `,
	    data: true
		});
	});

	// delete latex file
	fs.unlink(latex_path, (err) => {
	  if (err) throw err;
	  console.log('@Latex: deleted Latex');
	});

};


///////////////////////////////////////////////////////////////////////////////
/// export module

module.exports = {
	createTex: createTex,
	createPdf: createPdf,
	deletePdf: deletePdf
};
