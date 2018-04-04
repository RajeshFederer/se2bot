'use strict';

let action = {};
let clientDetails = require('../data/config').clientDetails;
let apiService = require('../service/api');

action.getPolicyInfo = (req, res) => {
    console.log('IN GETPOLICYINFO', JSON.stringify(req.body));
    let policyNo, policyInfo;
    let parameters = req.body.result.parameters;
    if (parameters.policyInfo) {
        policyInfo = parameters.policyInfo;
    }
    let userInfo = clientDetails.find(client => {
        return client.FirstName.toLowerCase() == policyInfo.toLowerCase() || client.LastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase();
    });
    console.log('USER INFO ', userInfo);
    if (userInfo) {
        policyNo = userInfo.policyDetails.PolicyNumber;
        let resMsg = {
            speech: '',
            messages: [
                // {
                //     "type": 0,
                //     "platform": "facebook",
                //     "speech": "Hi " + userInfo.FirstName + " " + userInfo.LastName + " , Here are your existing Portfolio details for variable annuity policy No <b>" + policyNo + "<b> </br>",
                // },
                {
                    "type": 1,
                    "platform": "facebook",
                    "title": "Hi " + userInfo.FirstName + " " + userInfo.LastName,
                    "subtitle": "Here are your existing Portfolio details for variable annuity policy No <b>" + policyNo + "<b> </br>",
                    "imageUrl": "https://static1.valueresearchonline.com/story/images/23898_28-Oct-2015-BigQuestion.png",
                    "buttons": [{
                        "content_type": "text",
                        "text": "Portfolio details",
                        "postback": "Portfolio details"
                    }],
                    "data": {
                        "totalFund": userInfo.totalFund,
                        "fundDetails": userInfo.fundDetails
                    }
                },
                {
                    "type": 4,
                    "platform": "facebook",
                    "payload": {
                        "type": "fundDetailsTable",
                        "data": {
                            "totalFund": userInfo.totalFund,
                            "fundDetails": userInfo.fundDetails
                        }
                    }
                },
                {
                    "type": 4,
                    "platform": "facebook",
                    "payload": {
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
        let resObj = {
            //speech: "Your Policy Details are Invalid. Please Again confirm your policy number / First Name / Last Name",      
            followupEvent: {
                "name": "getPolicyInvalidEvent",
                "data": {}
            }
        };
        return res.json(resObj);
    }
}


action.fundSwitchSelectGoal = (req, res) => {

    console.log('HELLO', JSON.stringify(req.body));
    let contextInfo = req.body.result.contexts.find(context => {
        return context.name == "getcustomerinput-followup"
    });
    let policyInfo = contextInfo.parameters.policyInfo;

    let userInfo = clientDetails.find(client => {
        return client.FirstName.toLowerCase() == policyInfo.toLowerCase() || client.LastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase();
    });

    let serviceNowUrl = 'https://hex-rule-engine.herokuapp.com/rest/api/?q=' + userInfo.policyDetails.PolicyNumber;
    apiService.callApi(serviceNowUrl, "GET")
        .then(body => {
            console.log('JJJJ', body);
            let data = body;

            let resMsg = {
                speech: '',
                messages: [
                    {
                        "type": 1,
                        "platform": "facebook",
                        "title": "",
                        "subtitle": "Thank you!! Based on your selection, the below auto switch request will be processed.",
                        "imageUrl": "https://static1.valueresearchonline.com/story/images/23898_28-Oct-2015-BigQuestion.png",
                        "buttons": [{
                            "content_type": "text",
                            "text": "Fund Switch details",
                            "postback": "Fund Switch details"
                        }],
                        "data": {
                            type: "fundSwitchTable",
                            BeforeFundSwitch: {
                                "Equity": {
                                    "FundName": data.EquityFundName,
                                    "TotalValue": data.BeforeCashVal.toFixed(2),
                                    "UnitBalance": data.BeforeOutstanding.toFixed(2),
                                    "Current%": data.BeforePercentSplit.toFixed(2),
                                    "SwitchAmount": data.EquitySwitchAmt,
                                    "CurrentNAV": data.EquityNAV,
                                    "Switchout": data.EquitySwitchout,
                                    "Switchin": data.EquitySwitchin
                                },
                                "Bond": {
                                    "FundName": data.BondFundName,
                                    "TotalValue": data.BeforeMMCashVal.toFixed(2),
                                    "UnitBalance": data.BeforeMMOutstanding.toFixed(2),
                                    "Current%": data.BeforeMMPercentSplit.toFixed(2),
                                    "SwitchAmount": data.BondSwitchAmt,
                                    "CurrentNAV": data.BondNAV,
                                    "Switchout": data.MMSwitchout,
                                    "Switchin": data.MMSwitchin
                                }
                            },
                            AfterFundSwitch: {
                                "Equity": {
                                    "FundName": data.EquityFundName,
                                    "TotalValue": data.AfterCashValue.toFixed(2),
                                    "UnitBalance": data.AfterEquityUnits.toFixed(2),
                                    "Current%": data.RecommendedEquitySplit.toFixed(2),
                                    "CurrentNAV": data.EquityNAV
                                },
                                "Bond": {
                                    "FundName": data.BondFundName,
                                    "TotalValue": data.AfterMMCashValue.toFixed(2),
                                    "UnitBalance": data.AfterMMEquityUnits.toFixed(2),
                                    "Current%": data.RecommendedMM.toFixed(2),
                                    "CurrentNAV": data.BondNAV
                                }
                            }
                        }
                    },
                    {
                        "type": 4,
                        "platform": "facebook",
                        "payload": {
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

        }).catch(err => {
            console.log('ERROR ', err);
            return res.json({
                "speech": "Perblem in Server. Please Try Again",
                "displayText": "Perblem in Server. Please Try Again",
                "messages": [{
                    "type": 0,
                    "platform": "facebook",
                    "speech": "Perblem in Server. Please Try Again"
                }]
            });
        })

};


action.fundSwitch = (req, res) => {
    console.log('FUND ', JSON.stringify(req.body));
    let contextInfo = req.body.result.contexts.find(context => {
        return context.name == "getcustomerinput-followup"
    });
    let policyInfo = contextInfo.parameters.policyInfo;

    let userInfo = clientDetails.find(client => {
        return client.FirstName.toLowerCase() == policyInfo.toLowerCase() || client.LastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase();
    });

    if (userInfo) {
        console.log('USRINFO', userInfo);
        let resMsg = {
            speech: '',
            messages: [
                {
                    "type": 0,
                    "platform": "facebook",
                    "speech": "Before I help you process your request, Here is our recommendation based on your current age <b>" + userInfo.Age + "</b> , income <b>" + userInfo.AnnualEarnedIncome + " per annum</b>, state <b>" + userInfo.State + "</b> & current market conditions."
                },
                {
                    "type": 4,
                    "platform": "facebook",
                    "payload": {
                        "type": "chart_safetynet"
                    }
                },
                {
                    "type": 4,
                    "platform": "facebook",
                    "payload": {
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
        if (userInfo.FinancialGuidanceStrategy == 'Aggressive') {
            resMsg.messages[1].payload = {
                "type": "chart_aggressive"
            };
        }
        return res.json(resMsg);
    } else {
        return res.json({
            "speech": "Perblem in Server. Please Try Again",
            "displayText": "Perblem in Server. Please Try Again",
            "messages": [{
                "type": 0,
                "platform": "facebook",
                "speech": "Problem in Server. Please Try Again"
            }]
        });
    }
};

action.appointmentConfirm = (req, res) => {
    console.log('LOG ', JSON.stringify(req.body.result));
    let parameters = req.body.result.parameters;
    let appointmentName;
    if (parameters.appointmentName) {
        appointmentName = parameters.appointmentName;
    }

    let contextInfo = req.body.result.contexts.find(context => {
        return context.name == "getcustomerinput-followup"
    });
    let policyInfo = contextInfo.parameters.policyInfo;

    let userInfo = clientDetails.find(client => {
        return client.FirstName.toLowerCase() == policyInfo.toLowerCase() || client.LastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase();
    });
    if (userInfo) {
        bpmCall(userInfo);
        console.log('KILLER ', JSON.stringify(req.body));
        return res.json({
            speech: '',
            messages: [
                {
                    "type": 0,
                    "platform": "facebook",
                    "speech": "Your appointment with Mathew has been confirmed for <b>" + appointmentName + ", Mathew</b> will be reaching out to discuss further, Have a great day!!"
                }]
        });
    } else {
        return res.json({
            "speech": "Perblem in Server. Please Try Again",
            "displayText": "Perblem in Server. Please Try Again",
            "messages": [{
                "type": 0,
                "platform": "facebook",
                "speech": "Problem in Server. User Not Found"
            }]
        });
    }
};


function bpmCall(userInfo) {
    let serviceNowUrl = 'https://172.25.94.35:9444/rest/bpm/wle/v1/process?action=start&bpdId=25.33574618-af8b-4ee6-90c3-1613667d3c7e&processAppId=2066.3ca235e7-d0ac-46e9-80fd-b4c08f5ff52e&parts=all';
    let reqBody = {
        "policyBasicInfo":
            {
                "policyName": "Policy Name(static)",
                "policyNo": userInfo.policyDetails.PolicyNumber,
                "companyName": userInfo.Employer,
                "policyStatus": userInfo.policyDetails.PolicyStatus,
                "planName": "PlanA (static)",
                "planDate": "04-04-2018 (static)"
            }
    };

    apiService.callApi(serviceNowUrl, "POST", reqBody)
        .then(body => {
            console.log('SUCCESS', body);
        })
        .catch(err => {
            console.log('BPM Call failed', err);
        })
}

module.exports = action;