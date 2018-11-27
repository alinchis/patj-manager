// routes/index.js


// // import controllers from /controllers folder
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';
// import POP_dom_SV_107Ds from '../controllers/pop_dom_sv_107d';
import LatexFile from '../latex';
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

// // SIRUTA:Regions
// GET clear all data from Regions
router.get('/regions/clear', Regions.clear);
// UPLOAD CSV file to DB
router.get('/regions/uploadCSV', Regions.uploadCSV);
// GET all regions
router.get('/regions/list', Regions.list);

// // SIRUTA:Counties
// GET clear all data from Counties
router.get('/counties/clear', Counties.clear);
// UPLOAD CSV file to DB
router.get('/counties/uploadCSV', Counties.uploadCSV);
// GET all Counties
router.get('/counties/list', Counties.list);

// // SIRUTA:Localities
// GET clear all data from Localities
router.get('/localities/clear', Localities.clear);
// UPLOAD CSV file to DB
router.get('/localities/uploadCSV', Localities.uploadCSV);
// GET all records from Localities
router.get('/localities/list', Localities.list);

// GET all UAT from County
router.get('/:sirutaSup/uat', Localities.UATlist);
// GET all localities from UAT
router.get('/:sirutaUAT/localities', Localities.localities);

// // LaTeX
// create Pdf file for given UAT
router.get('/uat/:sirutaUAT/pdfcreate', LatexFile.requestPdf);
// delete Pdf file for given UAT
router.get('/uat/:sirutaUAT/pdfdelete', LatexFile.removePdf);


// /////////////////////////////////////////////////////////////////////////////
// // export module

module.exports = router;
