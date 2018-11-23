// import controllers from /controllers folder
import Regions from '../controllers/ro_siruta_region';
import Counties from '../controllers/ro_siruta_county';
import Localities from '../controllers/ro_siruta_locality';
import POP_dom_SV_107Ds from '../controllers/pop_dom_sv_107d';
// import LatexFile from '../latex';
// import Tempo from '../insse';


export default (app) => {

  // test route
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the PATJ API!'
  }));

  // API route: UPLOAD initial data to PostgreSQL
  // app.get('/api/dbinit', dbinit.uploadData);
  // API route: GET all regions
  app.get('/api/regions', Regions.list);
  // API route: GET all Counties
  app.get('/api/counties', Counties.list);
  // API route: GET all UAT from County
  app.get('/api/:sirutaSup/uat', Localities.UATlist);
  // API route: GET all localities from UAT
  app.get('/api/:sirutaUAT/localities', Localities.localities);
  // API route: create Pdf file for given UAT
  // app.get('/api/uat/:sirutaUAT/pdfcreate', LatexFile.createPdf);
  // API route: delete Pdf file for given UAT
  // app.get('/api/uat/:sirutaUAT/pdfdelete', LatexFile.deletePdf);
  // API route: GET all population for SV
  app.get('/api/uat/SV/pop', POP_dom_SV_107Ds.list);

  ////////////////////////////////////////////////////////////////////
  /// API routes for INSSE Tempo online database
  // app.get('/api/tempo/level2', Tempo.readLevel2);

  // // API route for user to create a book
  // app.post('/api/users/:userId/books', Books.create);
  // // API route for user to edit a book
  // app.put('/api/books/:bookId', Books.modify);
  // // API route for user to delete a book
  // app.delete('/api/books/:bookId', Books.delete);
  // // API route for user to get all books in the database
  // app.get('/api/books', Books.list);


};
