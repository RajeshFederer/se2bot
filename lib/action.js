'use strict';

let action = {};
let clientDetails = require('../data/config').clientDetails;

action.getPolicyInfo = (req, res) => {
    console.log('IN GETPOLICYINFO');
    let policyNo, policyInfo;
    let parameters = req.body.result.parameters;
    if(parameters.policyInfo){
        policyInfo = parameters.policyInfo;
    }
    let userInfo;
    const userInfo = clientDetails.find(client =>{ 
        return client.firstName.toLowerCase() == policyInfo.toLowerCase() ||  client.lastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase();
    });
    console.log('USER INFO ',userInfo);
    if(userInfo){
        policyNo = userInfo.policyDetails.PolicyNumber;
        let resMsg = {
            speech: '',
            messages: [
              {
                "type": 0,
                "platform": "facebook",
                "speech": "Hi " +userInfo.firstName + " " + userInfo.lastName + " , Here are your existing Portfolio details for variable annuity policy No "+policyNo + " </br></br> Alamere Equity Income</br> Alamere Money Market."
              },
                {
                  "type": 4,
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

    } else {
        let resObj =  {
            speech: "Your Policy Details are Invalid. Please Again confirm your policy number / First Name / Last Name",      
            followupEvent :{
                "name" : "getPolicyInfo",
                "data" : {}
            }
        };
        return res.json(resObj);
    }
  }

  module.exports = action;