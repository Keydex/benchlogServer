const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql');
const path = require('path');
require('dotenv').config()

const bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, 'public')))

var connection = mysql.createConnection({
  host     : process.env.host,
  user     : process.env.user,
  password : process.env.password,
  database : process.env.database
});


/*

Return: [MaxMemory, AvgMemory]
*/
function helper_memUsage(memoryData){
  let maxMemory = -1;
  let totalMemory = 0;
  let tmpVal = -1;
  for (i in memoryData){
    tmpVal = parseInt(memoryData[i]);
    totalMemory += tmpVal;
    if(parseInt(tmpVal) > maxMemory){
      maxMemory = tmpVal;
    }
  }
  console.log(totalMemory)
  //Convert to MB
  return [Math.round(maxMemory/1000000), Math.round((totalMemory/1000000)/memoryData.length)]
}

function helper_cpuUsage(memoryData, cores){
  return -2;
}
/*
Save data to database


*/
connection.connect();
function db_saveData(data){
  dataName = data.projectName;
  dataFeatures = JSON.stringify(data.features);
  dataRunTime = data.runTime;
  infoMemory = helper_memUsage(data.infoMemoryUsage);
  dataMaxMem = infoMemory[0];
  dataAvgMem = infoMemory[1];
  jsonData = {test:'testvariable'};
  jsonData = JSON.stringify(jsonData);
  dataCPU = helper_cpuUsage(data.infoCpuUsage, data.cores);
  const newProject = {projectName: dataName, features: dataFeatures, runtime:dataRunTime, avgMem:dataAvgMem, maxMem:dataMaxMem, cpuUsage:dataCPU, data:jsonData};
  connection.query('INSERT INTO projectLog SET ? ', newProject ,function (error, results, fields) {
    if (error) throw error;
    console.log('result inserted');
  });
  console.log(newProject);
  return;
}

function db_getProjectIDs(){
  return -1;
}


app.get('/', (req, res) => res.send('Hello World!'))

app.get('/projectIDs', (req, res) => {
  //Send list of projectIDs
  res.send('Hello World!')
})

app.post('/', function (req, res) {
  res.status(200).send('Data saved!')
  console.log('Post Request recieved with Data ' + JSON.stringify(req.body))
  db_saveData(req.body);
})

app.listen(port, () => console.log(`benchlogServer running on Port: ${port}!`))
