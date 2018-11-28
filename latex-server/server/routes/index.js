// routes/index.js

// // import controllers from /controllers folder
import Latex from '../controllers/latex';


const express = require('express');

const router = express.Router();


// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});
// define the home page /test route
router.get('/', (req, res) => {
  res.status(200).send('Welcome to the LaTeX API!');
});

// API route: POST create the Pdf file from the given latex code
router.post('/create', Latex.create);
router.post('/remove', Latex.remove);


module.exports = router;
