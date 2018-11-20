'use strict';

// import libraries
import fs from 'fs';
import path from 'path';
import sequelize from 'sequelize';
import latex from 'node-latex';

// import controllers
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';


///////////////////////////////////////////////////////////////////////////////
/// declare functions

// create pdf file for given UAT code_siruta
function createPdf(req, res) {
	const { sirutaUAT } = req.params;
	const latex_path = __dirname + '/template.tex';
	const pdf_path = './static/' + sirutaUAT + '.pdf';

	console.log('@Latex: create Pdf > ', sirutaUAT);

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

// delete pdf file for given UAT code_siruta
function deletePdf(req, res) {
	const { sirutaUAT } = req.params;
	const pdf_path = './static/' + sirutaUAT + '.pdf';

	console.log('@Latex: delete Pdf > ', sirutaUAT);
	fs.unlink(pdf_path, (err) => {
	  if (err) throw err;
	  console.log('@Latex: deleted Pdf');
		return res.status(201).send({
	    message: `Pdf file for UAT with siruta ${sirutaUAT} has been deleted `,
	    data: true
		});
	});

};


///////////////////////////////////////////////////////////////////////////////
/// export module

module.exports = {
	createPdf: createPdf,
	deletePdf: deletePdf
};
