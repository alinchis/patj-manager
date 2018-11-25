// routes/index.js


// // import controllers from /controllers folder
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';
// import POP_dom_SV_107Ds from '../controllers/pop_dom_sv_107d';
// // import LatexFile from '../latex';
// // import Tempo from '../insse';

const express = require('express');

const router = express.Router();


// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});
// define the home page /test route
router.get('/', (req, res) => res.status(200).send('Welcome to the PATJ API!'));

// API route: GET clear all data from Regions
router.get('/regions/clear', Regions.clear);
// API route: UPLOAD CSV file to DB
router.get('/regions/uploadCSV', Regions.uploadCSV);
// API route: GET all regions
router.get('/regions/list', Regions.list);

// API route: GET clear all data from Counties
router.get('/counties/clear', Counties.clear);
// API route: UPLOAD CSV file to DB
router.get('/counties/uploadCSV', Counties.uploadCSV);
// API route: GET all Counties
router.get('/counties/list', Counties.list);

// API route: GET clear all data from Localities
router.get('/localities/clear', Localities.clear);
// API route: UPLOAD CSV file to DB
router.get('/localities/uploadCSV', Localities.uploadCSV);
// APY route: GET all records from Localities
router.get('/localities/list', Localities.list);

// API route: GET all UAT from County
router.get('/:sirutaSup/uat', Localities.UATlist);
// API route: GET all localities from UAT
router.get('/:sirutaUAT/localities', Localities.localities);
// API route: create Pdf file for given UAT
// router.get('/uat/:sirutaUAT/pdfcreate', LatexFile.createPdf);
// API route: delete Pdf file for given UAT
// router.get('/uat/:sirutaUAT/pdfdelete', LatexFile.deletePdf);
// API route: GET all population for SV
// router.get('/uat/SV/pop', POP_dom_SV_107Ds.list);


module.exports = router;
