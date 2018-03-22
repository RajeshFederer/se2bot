'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/', (req, res) =>{
    let resObj =  {
        "speech": "Hi Fredrick Gonsalves, Here are your existing Portfolio details for Variable Annuity Policy No $policyInfo.original",
        "messages": [{
          "type": 0,
          "platform": "facebook",
          "speech": "Hi Fredrick Gonsalves, Here are your existing Portfolio details for Variable Annuity Policy No $policyInfo.original"
        },
        {
          "type": 2,
          "platform": "facebook",
          "title": "Would you like me to help you with your investment planning?",
          "replies": [
            "Yes",
            "No"
          ]
        }]
    };
    console.log('IN', req.body);
    return res.json(resObj);
});

app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});