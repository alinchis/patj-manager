import http from 'http';
import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import routes from './server/routes';
import fs from 'fs';
import path from 'path';
// import the function to load initial data to DB
import dbinit from './server/dbinit';

const hostname = 'control-server';
const port = 3030;
// setup express application
const app = express()
const server = http.createServer(app);

// log requests to the console
app.use(logger('dev'));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// open static folder to the network to deliver files (pdf)
app.use('/static', express.static(path.join(__dirname, 'static')));

// API route: UPLOAD initial data to PostgreSQL
// dbinit.uploadData();

// load routes from /routes folder
routes(app);

app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the default API route',
}));

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
