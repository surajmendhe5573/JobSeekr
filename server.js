const express = require('express');
require('dotenv').config();
const constant = require('./config/keys');
const bodyParser = require('body-parser');

const app = express();

const Port = process.env.PORT || PORT || 6000;
const env = process.env.NODE_ENV || NODE_ENV || 'development';

// Middleware to parse incoming JSON requests
app.use(express.json());
app.use(bodyParser.json());

require('./db/DB'); 

app.get('/', (req, res) => {
    res.send('Jai Shree Ram');
});

app.use('/api/user', require('./routes/user'));
app.use('/api/jobseeker', require('./routes/jobseeker'));
app.use('/api/employer', require('./routes/employer'));

// Start the server and log the port and environment being used
app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port} in ${env} environment`);
});
