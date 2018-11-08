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
  console.log('LENGTH OF MEMORY DATA' + memoryData.length)
  console.log(memoryData);
  if(memoryData.length == 3){
    return [Math.round(memoryData[0]), Math.round(memoryData[0])]
  }
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
/*

Return: [AvgUsage]
*/
function helper_avgUsage(memoryData){
  let totalUsage = 0;
  let tmpVal = -1;
  console.log('LENGTH OF MEMORY DATA' + memoryData.length)
  console.log(memoryData);
  if(memoryData.length == 3){
    return [Math.round(memoryData[0])]
  }
  for (i in memoryData){
    tmpVal = parseInt(memoryData[i]);
    totalUsage += tmpVal;
  }
  //Convert to MB
  return [Math.round(totalUsage/memoryData.length)]
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
  jsonData = {}
  jsonData.runTime = JSON.stringify(data.infoRunTime)
  jsonData.cpuUsage = JSON.stringify(data.infoCpuUsage)
  jsonData.memoryUsage = JSON.stringify(data.infoMemoryUsage)
  jsonData.progress = JSON.stringify(data.infoProgress)
  if(data.gpuName != undefined){
    jsonData.gpuMemUsage = JSON.stringify(data.infoGpuMemUtil)
    jsonData.gpuUsage = JSON.stringify(data.infoGpuUsage)
    jsonData.gpuMemUtil = JSON.stringify(data.infoGpuMemUtil)
    jsonData.gpuUUID = data.gpuUUID
    jsonData.gpuDriver = data.gpuDriver
  }
  jsonData = JSON.stringify(jsonData);
  dataCPU = helper_cpuUsage(data.infoCpuUsage, data.cores);
  let newProject = {projectName: dataName, features: dataFeatures, runtime:dataRunTime, avgMem:dataAvgMem, maxMem:dataMaxMem, cpuUsage:dataCPU, data:jsonData};
  if(data.gpuName != undefined){
    newProject.gpuName = data.gpuName
    newProject.avgGpuMem = helper_memUsage(data.infoGpuMemUsage)[1];
    newProject.avgGpuUsage = helper_avgUsage(data.infoGpuUsage)[0];
    newProject.avgGpuMemUtil = helper_avgUsage(data.infoGpuMemUtil)[0];
  }
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
