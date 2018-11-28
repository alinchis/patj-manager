
// import libraries
import fs from 'fs';

const latex = require('node-latex');


// ////////////////////////////////////////////////////////////////////////////
// METHODS

function createPdf(content, savePath) {
  const output = fs.createWriteStream(savePath);
  const pdf = latex(content);

  pdf.pipe(output);
  pdf.on('error', (err) => {
    output.end();
    return err;
  });
  pdf.on('finish', () => {
    console.log('PDF generated!');
    output.end();
    return true;
  });
}

// ////////////////////////////////////////////////////////////////////////////
// REQUESTS

// create pdf file for given UAT code_siruta
async function create(req, res) {
  const { codeSiruta, content } = req.body;
  const pdfPath = `./static/${codeSiruta}.pdf`;

  // create corresponding latex file
  createPdf(content, pdfPath);
  // return message
  return res.status(201).send({
    message: `Pdf file for UAT with siruta ${codeSiruta} has been created `,
    data: true,
  });
}


// remove pdf file
function remove(req, res) {
  const { codeSiruta } = req.body;
  const pdfPath = `./static/${codeSiruta}.pdf`;
  // delete pdf file
  fs.unlink(pdfPath, (err) => {
    if (err) throw err;
    console.log('@Latex-server: deleted Pdf');
    return res.status(200).send({
      message: `Pdf file for UAT with siruta ${codeSiruta} has been deleted `,
      data: true,
    });
  });
}

// /////////////////////////////////////////////////////////////////////////////
// // EXPORT module

module.exports = {
  create,
  remove,
};
