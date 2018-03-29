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
                "speech": "Hi " +userInfo.FirstName + " " + userInfo.LastName + " , Here are your existing Portfolio details for variable annuity policy No "+policyNo + " </br></br></br> " + "<b>"+userInfo.fundDetails[0].fundName +"</b></br> CashValue : "+userInfo.fundDetails[0].CashValue + "</br> Unit : "+userInfo.fundDetails[0].Units +" </br></br>" + "<b>"+userInfo.fundDetails[1].fundName +"</b></br> CashValue : "+userInfo.fundDetails[1].CashValue+" </br> Unit : "+userInfo.fundDetails[1].Units+" </br></br> " + "<b>Total : "+ userInfo.totalFund+"</b>"
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
                "name" : "getPolicyInvalidEvent",
                "data" : {}
            }
        };
        return res.json(resObj);
    }
  }


  action.fundSwitchSelectGoal = (req, res) =>{

    console.log('HELLO', JSON.stringify(req.body));
    let contextInfo = req.body.result.contexts.find(context =>{
        return context.name == "getcustomerinput-followup"
    });
    let policyInfo = contextInfo.parameters.policyInfo;

    let userInfo = clientDetails.find(client =>{ 
        return client.FirstName.toLowerCase() == policyInfo.toLowerCase() ||  client.LastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase();
    });
    
    let serviceNowUrl = 'https://hex-rule-engine.herokuapp.com/rest/api/?q=' + userInfo.policyDetails.PolicyNumber;
    apiService.callApi(serviceNowUrl, "GET")
    .then(body =>{
        console.log('JJJJ', body);
        let data = body;

        let resMsg = {
            speech: '',
            messages: [
              {
                "type": 0,
                "platform": "facebook",
                "speech": "Thank you!! Based on your selection, the below auto switch request will be processed. </br></br> <b>Before Fund Switch</b></br> Total Value(Equity) :" + data.BeforeCashVal.toFixed(2) + "</br> UnitBalance(Equity) :" + data.BeforeOutstanding.toFixed(2) +  "</br> Current  %(Equity) :" + data.BeforePercentSplit.toFixed(2)  + "</br> Total Value(Bond) :" + data.BeforeMMCashVal.toFixed(2) +  "</br> UnitBalance (Bond) :" + data.BeforeMMOutstanding.toFixed(2) + "</br> Current  %(Bond) :" + data.BeforeMMPercentSplit.toFixed(2) + 
                 "</br></br> <b>After Fund Switch</b></br> Total Value(Equity) :" + data.AfterCashValue.toFixed(2) + "</br> UnitBalance(Equity) :" + data.AfterEquityUnits.toFixed(2) +  "</br> Current  %(Equity) :" + data.RecommendedEquitySplit.toFixed(2)  + "</br> Total Value(Bond) :" + data.AfterMMCashValue.toFixed(2) +  "</br> UnitBalance (Bond) :" + data.AfterMMEquityUnits.toFixed(2) + "</br> Current  %(Bond) :" + data.RecommendedMM.toFixed(2) 
              },
              {
                  "type": 4,
                  "platform": "facebook",
                  "payload":{
                    "facebook": {
                        "text": "Shall I go ahead and process the fund switch request?",
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

    }).catch(err =>{
        console.log('ERROR ',err);
        return res.json({ 
            "speech": "Perblem in Server. Please Try Again",
            "displayText": "Perblem in Server. Please Try Again",
            "messages": [{
              "type": 0,
              "platform": "facebook",
              "speech": "Perblem in Server. Please Try Again"
        }]});
    })

  };


  action.fundSwitch = (req, res) =>{
    console.log('FUND ', JSON.stringify(req.body));
    let contextInfo = req.body.result.contexts.find(context =>{
        return context.name == "getcustomerinput-followup"
    });
    let policyInfo = contextInfo.parameters.policyInfo;

    let userInfo = clientDetails.find(client =>{ 
        return client.FirstName.toLowerCase() == policyInfo.toLowerCase() ||  client.LastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase();
    });

    if(userInfo){
        let resMsg = {
            speech: '',
            messages: [
              {
                "type": 0,
                "platform": "facebook",
                "speech": "Before I help you process your request, Here is our recommendation based on your current age of "+ userInfo.Age+", income of "+userInfo.AnnualEarnedIncome+" Per Annum, state of "+ userInfo.State+" & current market conditions."
              },
              {
                "type": 4,
                "platform": "facebook",
                "payload":{
                    "type": "chart"
                }
              },
              {
                "type": 0,
                "platform": "facebook",
                "speech": userInfo.FinancialGuidanceStrategy == "Safetynet" ? "Safety Net is the highest priority goal we recommend for investors. Our allocation for this goal is fixed at 40% stocks. Our rigious modeling and testing has shown that investing is a reliable alternative to a cash savings account." : "With our retirement goal we assume you'll ease into full retirement mode-rather than needing all your money on an exact date in future. When you have 20 or more years untill your planned retirement age, we recommend 90% stocks in order to maximum growth."
              },
              {
                  "type": 4,
                  "platform": "facebook",
                  "payload":{
                    "facebook": {
                        "quick_replies": [
                          {
                            "content_type": "text",
                            "title": "Select this goal",
                            "payload": "Select this goal"
                          },
                          {
                            "content_type": "text",
                            "title": "No. Choose my own funds",
                            "payload": "No. Choose my own funds"
                          }
                        ]
                    }
                  }
                }
            ]
        };
        return res.json(resMsg);
    } else {
        return res.json({ 
            "speech": "Perblem in Server. Please Try Again",
            "displayText": "Perblem in Server. Please Try Again",
            "messages": [{
              "type": 0,
              "platform": "facebook",
              "speech": "Perblem in Server. Please Try Again"
        }]});
    }
};

module.exports = action;