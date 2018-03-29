'use strict';

let action = {};
let clientDetails = require('../data/config').clientDetails;
let apiService = require('../service/api');

action.getPolicyInfo = (req, res) => {
    console.log('IN GETPOLICYINFO');
    let policyNo, policyInfo;
    let parameters = req.body.result.parameters;
    if(parameters.policyInfo){
        policyInfo = parameters.policyInfo;
    }
    let userInfo = clientDetails.find(client =>{ 
        return client.FirstName.toLowerCase() == policyInfo.toLowerCase() ||  client.LastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase();
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
                "speech": "Hi " +userInfo.FirstName + " " + userInfo.LastName + " , Here are your existing Portfolio details for variable annuity policy No "+policyNo + " </br></br> Alamere Equity Income</br> Alamere Money Market."
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
                          "payload": "no_policy"
                        }
                      ]
                    }
                  }
                }
            ]
        };
        return res.json(resMsg);

    } else {
        console.log('INVALID POLICY');
        let resObj =  {
            //speech: "Your Policy Details are Invalid. Please Again confirm your policy number / First Name / Last Name",      
            followupEvent :{
                "name" : "getPolicy-Invalid",
                "data" : {}
            }
        };
        return res.json(resObj);
    }
  }


  action.fundSwitchSelectGoal = (req, res) =>{


    let serviceNowUrl = 'https://dev18442.service-now.com/api/now/v1/table/incident';
    apiService.callApi(serviceNowUrl, "POST" , reqObj)
    .then(body =>{

    })

    .catch(err =>{
        return res.json(data.serverError);
    })

  };

  module.exports = action;