// routes/index.js

var express = require('express');
var router = express.Router();


// // import controllers from /controllers folder
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
// import Localities from '../controllers/ro_siruta_locality';
// import POP_dom_SV_107Ds from '../controllers/pop_dom_sv_107d';
// // import LatexFile from '../latex';
// // import Tempo from '../insse';


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page /test route
router.get('/', function (req, res) {
  res.status(200).send('Welcome to the PATJ API!');
});

// API route: GET all regions
router.get('/regions', Regions.list);
// API route: GET all Counties
router.get('/counties', Counties.list);
//   // API route: GET all UAT from County
//   // router.get('/api/:sirutaSup/uat', Localities.UATlist);
//   // API route: GET all localities from UAT
//   // router.get('/api/:sirutaUAT/localities', Localities.localities);
//   // API route: create Pdf file for given UAT
//   // router.get('/api/uat/:sirutaUAT/pdfcreate', LatexFile.createPdf);
//   // API route: delete Pdf file for given UAT
//   // router.get('/api/uat/:sirutaUAT/pdfdelete', LatexFile.deletePdf);
//   // API route: GET all population for SV
//   // router.get('/api/uat/SV/pop', POP_dom_SV_107Ds.list);


module.exports = router;
