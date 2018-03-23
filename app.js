'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/', (req, res) =>{
  if(req.body.result.action == "getPolicyInfo"){
    let policyNo;
    let parameters = element.parameters;
    if(parameters.policyInfo){
      policyNo = parameters.policyInfo;
    }
    let resMsg = {
      speech: '',
      messages: [
        {
          "type": 0,
          "platform": "facebook",
          "speech": "Hi Fredrick Gonsalves, Here are your existing Portfolio details for variable annuity policy No "+policyNo + "\n\n Alamere Equity Income\n Alamere Money Market. \n"
        },
          {
            "type": 2,
            "platform": "facebook",
            "payload":{
              "facebook": {
                "text": "Would you like me to help you with your investment planning?",
                "quick_replies": [
                  {
                    "content_type": "text",
                    "title": "Yes",
                    "payload": "Yes"
                  },
                  {
                    "content_type": "text",
                    "title": "No",
                    "payload": "No"
                  }
                ]
              }
            }
          }
        ]
  };
    return res.json(resMsg);
  }
});

app.listen(port, function(){
    console.log('AGENT is running my app on  PORT: ' + port);
});