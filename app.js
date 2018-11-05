const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql');
require('dotenv').config()

const bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));



var connection = mysql.createConnection({
  host     : process.env.host,
  user     : process.env.user,
  password : process.env.password,
  database : process.env.database
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end();

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/', function (req, res) {
  res.status(200).send('Data saved!')
  console.log('Post Request recieved with Data ' + JSON.stringify(req.body))
})

app.listen(port, () => console.log(`benchlogServer running on Port: ${port}!`))
