import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';

// import routes
const indexr = require('./server/routes/index');
const tempor = require('./server/routes/tempo');
const dbr = require('./server/routes/db');

// server setup
const hostname = 'control-server';
const port = 3030;
const app = express();

// log requests to the console
app.use(logger('dev'));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// open static folder to the network to deliver files (pdf)
app.use('/static', express.static(path.join(__dirname, 'static')));

// load routes from /routes folder
app.use('/api', indexr);
app.use('/tempo', tempor);
app.use('/db', dbr);


app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the default route',
}));

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// start server
app.listen(3030, () => console.log('Control-Server App listening on port: ', port));
