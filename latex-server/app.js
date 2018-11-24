import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';

// import routes


// server setup
const hostname = 'control-server';
const port = 4040;
const app = express()

// log requests to the console
app.use(logger('dev'));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// open static folder to the network to deliver files (pdf)
app.use('/static', express.static(path.join(__dirname, 'static')));

// load routes from /routes folder


app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the default route',
}));


// start server
app.listen(port, () => console.log('LaTeX-Server App listening on port: ', port));
