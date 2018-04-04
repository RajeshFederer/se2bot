'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
let action = require('./lib/action');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/', (req, res) =>{
  if(req.body.result.action =="getPolicyInvalid"){
    return action["getPolicyInfo"](req, res);  
  } else{
    return action[req.body.result.action](req, res);
  }
});

app.get('/image',function(req,res){
  res.sendFile(path.join(__dirname, '/images/presentMarket.jpg'));
});

app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});