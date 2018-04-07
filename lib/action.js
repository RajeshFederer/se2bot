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
        return client.FirstName.toLowerCase() == policyInfo.toLowerCase() || client.LastName.toLowerCase() == policyInfo.toLowerCase() || client.policyDetails.PolicyNumber.toLowerCase() == policyInfo.toLowerCase() || client.SSNNumber.toLowerCase() == policyInfo.toLowerCase();
    });
    console.log('USER INFO ', userInfo);
    cusInfo[req.body.sessionId] = userInfo;
    if (userInfo) {
        policyNo = userInfo.policyDetails.PolicyNumber;
        chatLog[req.body.sessionId] = chatLog[req.body.sessionId] ? chatLog[req.body.sessionId] : "";
        chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Can you please confirm the last four digits of your SSN number?";
        let resMsg = {
            speech: 'Can you please confirm the last four digits of your SSN number?'
           
        };
        return res.json(resMsg);

    } else {
        console.log('INVALID POLICY');
        chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Your Policy Details are Invalid. Please Again confirm your policy number / First Name / Last Name";
        let resObj = {
            //speech: "Your Policy Details are Invalid. Please Again confirm your policy number / First Name / Last Name",      
            followupEvent: {
                "name": "getPolicyInvalidEvent",
                "data": {}
            }
        };
        return res.json(resObj);
    }
};

action.getSSNnumber = (req, res) => {
    console.log('IN GETSSN Number', JSON.stringify(req.body));
    let SSNNo, SSN_Number;
    let parameters = req.body.result.parameters;
    if (parameters.SSN_number) {
        SSN_Number = parameters.SSN_number;
    }
   
    if (cusInfo[req.body.sessionId].SSNLastDigit == SSN_Number) {
      console.log('INSIDE SSN VALID'+SSN_Number);
        /* let userInfo = clientDetails.find(client => {
             return client.SSNLastDigit == SSN_Number ;
         });
         console.log('USER INFO ', userInfo);
         
         if (userInfo) {*/
            chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Here are your existing Portfolio details for variable annuity policy No <b>" + cusInfo[req.body.sessionId].policyDetails.PolicyNumber + "</b> </br> Would you like me to help you with your investment planning?";
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
                    "title": "Hi " + cusInfo[req.body.sessionId].FirstName + " " + cusInfo[req.body.sessionId].LastName,
                    "subtitle": "Here are your existing Portfolio details for variable annuity policy No <b>" + cusInfo[req.body.sessionId].policyDetails.PolicyNumber + "</b>",
                    "imageUrl": "https://static1.valueresearchonline.com/story/images/23898_28-Oct-2015-BigQuestion.png",
                    "buttons": [{
                        "content_type": "text",
                        "text": "Portfolio details",
                        "postback": "Portfolio details"
                    }],
                    "data": {
                        "totalFund": cusInfo[req.body.sessionId].totalFund,
                        "ValuationDate": cusInfo[req.body.sessionId].ValuationDate,
                        "fundDetails": cusInfo[req.body.sessionId].fundDetails
                    }
                },
                {
                    "type": 4,
                    "platform": "facebook",
                    "payload": {
                        "type": "fundDetailsTable",
                        "data": {
                            "totalFund": cusInfo[req.body.sessionId].totalFund,
                            "ValuationDate": cusInfo[req.body.sessionId].ValuationDate,
                            "fundDetails": cusInfo[req.body.sessionId].fundDetails
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
        console.log('INVALID SSN');
        let resObj = {
            //speech: "Your Policy Details are Invalid. Please Again confirm your policy number / First Name / Last Name",      
            followupEvent: {
                "name": "getSSNnumber",
                "data": {}
            }
        };
        return res.json(resObj);
    }
};


action.fundSwitchSelectGoal = (req, res) => {

    console.log('HELLO', JSON.stringify(req.body));

    let userInfo = cusInfo[req.body.sessionId];
    let policyInfo = userInfo.policyDetails.PolicyNumber;
    let serviceNowUrl = 'https://hex-rule-engine.herokuapp.com/rest/api/?q=' + userInfo.policyDetails.PolicyNumber;
    apiService.callApi(serviceNowUrl, "GET")
        .then(body => {
            console.log('JJJJ', body);
            chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Thank you!! Based on your selection, the below auto switch request will be processed. </br> Shall I go ahead and process the fund switch request?";
            let data = body;
            let isSaftyNet = false;
            if(cusInfo[req.body.sessionId].FinancialGuidanceStrategy == "Safetynet"){
                isSaftyNet = true;
            }
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
                            "FinancialGuidanceStrategy" : cusInfo[req.body.sessionId].FinancialGuidanceStrategy,
                            "ValuationDate": cusInfo[req.body.sessionId].ValuationDate,
                            BeforeFundSwitch: {
                                "Equity": {
                                    "FundName": data.EquityFundName ? data.EquityFundName : 0,
                                    "CashValue": data.BeforeCashVal ? data.BeforeCashVal : 0,
                                    "Units": data.BeforeOutstanding ? data.BeforeOutstanding: 0,
                                    "UnitValue": data.EquityNAV ? data.EquityNAV : 0,
                                    "Current%": data.BeforePercentSplit ? data.BeforePercentSplit:0
                                },
                                "Bond": {
                                    "FundName": data.BondFundName ? data.BondFundName: 0,
                                    "CashValue": data.BeforeMMCashVal ? data.BeforeMMCashVal: 0,
                                    "Units": data.BeforeMMOutstanding ? data.BeforeMMOutstanding: 0,
                                    "UnitValue": data.BondNAV ? data.BondNAV : 0,
                                    "Current%": data.BeforeMMPercentSplit ? data.BeforeMMPercentSplit : 0
                                },
                                "TotalCashValue" : data.CurrentTotalCashValue ? data.CurrentTotalCashValue : 0
                            },
                            fundSwitchDetails : {
                                "Equity": {
                                    "target%" : data.RecommendedEquitySplit ? data.RecommendedEquitySplit : 0,
                                    "inAmount": data.AfterCashValue ? data.AfterCashValue : 0,
                                    "AmtBeSwitched":  isSaftyNet && data.AmtBeSwitched ? data.AmtBeSwitched: 0,
                                    "SwitchOutPer" : isSaftyNet && data.Switchoutpercent ? data.Switchoutpercent: 0,
                                    "SwitchOutUnits" : isSaftyNet && data.SwitchoutUnits ? data.SwitchoutUnits : 0,
                                    "SwitchInPer" : !isSaftyNet && data.Switchinpercent ? data.Switchinpercent: 0,
                                    "SwitchInAmount" : !isSaftyNet && data.SwitchinAmount ? data.SwitchinAmount : 0
                                },
                                "Bond": {
                                    "target%" : data.RecommendedMM ? data.RecommendedMM : 0,
                                    "inAmount": data.AfterMMCashValue ? data.AfterMMCashValue: 0,
                                    "AmtBeSwitched": !isSaftyNet && data.AmtBeSwitched ? data.AmtBeSwitched : 0,
                                    "SwitchOutPer" : !isSaftyNet && data.Switchoutpercent ? data.Switchoutpercent : 0,
                                    "SwitchOutUnits" : !isSaftyNet && data.SwitchoutUnits ? data.SwitchoutUnits: 0,
                                    "SwitchInPer" : isSaftyNet && data.Switchinpercent ? data.Switchinpercent : 0,
                                    "SwitchInAmount" : isSaftyNet && data.SwitchinAmount ? data.SwitchinAmount: 0
                                },
                                "TotalInAmount" : data.TotalRecommValue ? data.TotalRecommValue: 0
                            },
                            AfterFundSwitch: {
                                "Equity": {
                                    "FundName": data.EquityFundName ? data.EquityFundName : 0,
                                    "CashValue": data.AfterCashValue ? data.AfterCashValue : 0,
                                    "Units": data.AfterEquityUnits ? data.AfterEquityUnits : 0,
                                    "UnitValue": data.EquityNAV ? data.EquityNAV: 0,
                                    "Current%": data.RecommendedEquitySplit ? data.RecommendedEquitySplit: 0,
                                },
                                "Bond": {
                                    "FundName": data.BondFundName ? data.BondFundName: 0,
                                    "CashValue": data.AfterMMCashValue ? data.AfterMMCashValue: 0,
                                    "Units": data.AfterMMEquityUnits ? data.AfterMMEquityUnits: 0,
                                    "UnitValue": data.BondNAV ? data.BondNAV :0 ,
                                    "Current%": data.RecommendedMM ? data.RecommendedMM: 0
                                },
                                "TotalCashValue" : data.TotalRecommValue ? data.TotalRecommValue: 0
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

action['fundSwitchSelectGoal.fundSwitchSelectGoal-yes'] = (req, res) => {
    chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Thanks The Fund switch transaction has been submitted successfully! Please wait while I process your request. You will be receiving your detailed fund statement by email in the next 24 Hours on your registered email id. </br> Do you need any further assistance with your investment options?";
    return res.json({
        speech: '',
        messages: [
            {
                "type": 0,
                "platform": "facebook",
                "speech": "Thanks The Fund switch transaction has been submitted successfully! Please wait while I process your request. You will be receiving your detailed fund statement by email in the next 24 Hours on your registered email id."
            },
            {
                "type": 4,
                "platform": "facebook",
                "payload": {
                    "facebook": {
                        "text": "Do you need any further assistance with your investment options?",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "Yes",
                                "payload": "Yes. I need further assistance"
                            },
                            {
                                "content_type": "text",
                                "title": "No",
                                "payload": "I don't need further assistance"
                            }
                        ]
                    }
                }
            }
        ]
    });
};

action.getCustomerInput = (req, res) => {
    chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Alright, I am here to help! But before we start, can you please confirm if you already own a policy issued by Alamere Individual Company?";
    return res.json({
        speech: '',
        messages: [
            {
                "type": 4,
                "platform": "facebook",
                "payload": {
                    "facebook": {
                        "text": "Alright, I am here to help! But before we start, can you please confirm if you already own a policy issued by Alamere Individual Company?",
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
    });
};

action.fundSwitchChooseOwn = (req, res) => {
    chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Thanks, How would you like to submit the fund switch?";
    return res.json({
        speech: '',
        messages: [
            {
                "type": 0,
                "platform": "facebook",
                "speech": "Thanks, How would you like to submit the fund switch?"
            },
            {
                "type": 4,
                "platform": "facebook",
                "payload": {
                    "facebook": {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": [
                                    {
                                        "title": "Online and complete it",
                                        "image_url": "https://ic.pics.livejournal.com/fintraining/11748042/191744/191744_original.png",
                                        "buttons": [
                                            {
                                                "type": "postback",
                                                "text": "Choose",
                                                "postback": "Online"
                                            }
                                        ]
                                    },
                                    {
                                        "title": "Offline, would like to research my options more, send me the form to my email id",
                                        "image_url": "https://theparalegalsociety.files.wordpress.com/2011/08/person-typing.jpg",
                                        "buttons": [
                                            {
                                                "type": "postback",
                                                "text": "Choose",
                                                "postback": "Offline"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ]
    });
};

action.fundSwitchChooseOwnOnline = (req, res) => {
    chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Coming Soon </br> Do you need any further assistance with your investment options?";
    return res.json({
        speech: '',
        messages: [
            {
                "type": 0,
                "platform": "facebook",
                "speech": "Coming Soon"
            },
            {
                "type": 4,
                "platform": "facebook",
                "payload": {
                    "facebook": {
                        "text": "Do you need any further assistance with your investment options?",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "Yes",
                                "payload": "Yes. I need further assistance"
                            },
                            {
                                "content_type": "text",
                                "title": "No",
                                "payload": "I don't need further assistance"
                            }
                        ]
                    }
                }
            }
        ]
    });
};

action.fundSwitchChooseOwnOffline = (req, res) => {
    let userInfo = cusInfo[req.body.sessionId];
    chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: The Fund switch form has been forwarded to <b>" + userInfo.Email + "</b>, Please complete, sign and resubmit by 15:00 hours tomorrow to get yesterday's unit price. Any request submitted post 15:00 ET will need to wait till next day for settlement </br> Do you need any further assistance with your investment options?";
    return res.json({
        speech: '',
        messages: [
            {
                "type": 0,
                "platform": "facebook",
                "speech": "The Fund switch form has been forwarded to <b>" + userInfo.Email + "</b>, Please complete, sign and resubmit by 15:00 hours tomorrow to get yesterday's unit price. Any request submitted post 15:00 ET will need to wait till next day for settlement"
            },
            {
                "type": 4,
                "platform": "facebook",
                "payload": {
                    "facebook": {
                        "text": "Do you need any further assistance with your investment options?",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "Yes",
                                "payload": "Yes. I need further assistance"
                            },
                            {
                                "content_type": "text",
                                "title": "No",
                                "payload": "I don't need further assistance"
                            }
                        ]
                    }
                }
            }
        ]
    });
};

action.fundSwitch = (req, res) => {
    console.log('FUND ', JSON.stringify(req.body));

    let userInfo = cusInfo[req.body.sessionId];
    let policyInfo = userInfo.policyDetails.PolicyNumber;

    if (userInfo) {
        console.log('USRINFO', userInfo);
        chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Before I help you process your request, Here is our recommendation based on your current age <b>" + userInfo.Age + "</b> , income <b>" + userInfo.AnnualEarnedIncome + " per annum</b>, state <b>" + userInfo.State + "</b> & current market conditions.";
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

action.statusOfFundSwitch = (req, res) => {
    let userInfo = cusInfo[req.body.sessionId];
    if (userInfo) {
        chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: As per our records <b>" + userInfo.FirstName + " " + userInfo.LastName + " </b>,  your fund switch request submitted at 13:30:00 ET for Policy Number <b>" + userInfo.policyDetails.PolicyNumber + "</b> has been successfully submitted and your transaction id is TRN837377389. </br> Do you need any further assistance with your investment options?";
        return res.json({
            speech: '',
            messages: [
                {
                    "type": 0,
                    "platform": "facebook",
                    "speech": "As per our records <b>" + userInfo.FirstName + " " + userInfo.LastName + " </b>,  your fund switch request submitted at 13:30:00 ET for Policy Number <b>" + userInfo.policyDetails.PolicyNumber + "</b> has been successfully submitted and your transaction id is TRN837377389"
                },
                {
                    "type": 4,
                    "platform": "facebook",
                    "payload": {
                        "facebook": {
                            "text": "Do you need any further assistance with your investment options?",
                            "quick_replies": [
                                {
                                    "content_type": "text",
                                    "title": "Yes",
                                    "payload": "Yes. I need further assistance"
                                },
                                {
                                    "content_type": "text",
                                    "title": "No",
                                    "payload": "I don't need further assistance"
                                }
                            ]
                        }
                    }
                }
            ]
        });
    } else {
        let resObj = {
            //speech: "Your Policy Details are Invalid. Please Again confirm your policy number / First Name / Last Name",      
            followupEvent: {
                "name": "getPolicyInvalidEvent",
                "data": {}
            }
        };
        return res.json(resObj);
    }
};

action.connectToFinancialAdvisor = (req, res) => {
    chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Hold on!!! My colleague Mathew Clarke will answer this query. Here are the earliest available slots based on Mathew's calendar,Please confirm when you would like to be contacted for Finacial Advise";
    return res.json({
        speech: '',
        messages: [
            {
                "type": 4,
                "platform": "facebook",
                "payload": {
                    "facebook": {
                        "text": "Hold on!!! My colleague Mathew Clarke will answer this query. Here are the earliest available slots based on Mathew's calendar,Please confirm when you would like to be contacted for Finacial Advise",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "Apr 9th 11:00 AM - 12:00 AM ET",
                                "payload": "Apr 9th 11:00 AM - 12:00 AM ET"
                            },
                            {
                                "content_type": "text",
                                "title": "Apr 10th 1:00 PM - 2:00 PM ET",
                                "payload": "Apr 10th 1:00 PM - 2:00 PM ET"
                            },
                            {
                                "content_type": "text",
                                "title": "Apr 10th 4:00 PM - 5:00 PM ET",
                                "payload": "Apr 10th 4:00 PM - 5:00 PM ET"
                            },
                            {
                                "content_type": "text",
                                "title": "Apr 11th 3:30 PM - 4:30 PM ET",
                                "payload": "Apr 11th 3:30 PM - 4:30 PM ET"
                            }
                        ]
                    }
                }
            }
        ]
    });
};

action.appointmentConfirm = (req, res) => {

    let parameters = req.body.result.parameters;
    let appointmentName;
    if (parameters.appointmentName) {
        appointmentName = parameters.appointmentName;
    }

    if (cusInfo[req.body.sessionId]) {
        chatLog[req.body.sessionId] += "</br> USER : " + req.body.result.resolvedQuery + "</br> BOT: Your appointment with Mathew has been confirmed for <b>" + appointmentName + ", Mathew</b> will be reaching out to discuss further, Have a great day!! </br> Do you need any further assistance with your investment options?";
        bpmCall(cusInfo[req.body.sessionId], chatLog[req.body.sessionId], req.body.result.resolvedQuery);
        console.log('KILLER ', JSON.stringify(req.body));
        return res.json({
            speech: '',
            messages: [
                {
                    "type": 0,
                    "platform": "facebook",
                    "speech": "Your appointment with Mathew has been confirmed for <b>" + appointmentName + ", Mathew</b> will be reaching out to discuss further, Have a great day!!"
                },
                {
                    "type": 4,
                    "platform": "facebook",
                    "payload": {
                        "facebook": {
                            "text": "Do you need any further assistance with your investment options?",
                            "quick_replies": [
                                {
                                    "content_type": "text",
                                    "title": "Yes",
                                    "payload": "Yes. I need further assistance"
                                },
                                {
                                    "content_type": "text",
                                    "title": "No",
                                    "payload": "I don't need further assistance"
                                }
                            ]
                        }
                    }
                }
            ]
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

function bpmCall(userInfo, cLog, dTime) {
    console.log('YEAH', userInfo, globalCookie);
    let serviceNowUrl = 'https://ustrial01.bpm.ibmcloud.com/bpm/dev/rest/bpm/wle/v1/process?action=start&bpdId=25.33574618-af8b-4ee6-90c3-1613667d3c7e&processAppId=2066.3ca235e7-d0ac-46e9-80fd-b4c08f5ff52e&params={"policyBasicInfo": {"policyName":" ","policyNo": "'+userInfo.policyDetails.PolicyNumber +'","companyName":" ","policyStatus":"'+userInfo.policyDetails.PolicyStatus+'", "planName":"Plan A", "planDate": "04-04-2018"} ,"chatHistory" : "'+cLog+'" ,"appointmentTime" : "'+dTime}+'"&parts=all';
    let reqBody = {
        // "policyBasicInfo": {
        //     "policyName": "Policy Name",
        //     "policyNo": userInfo.policyDetails.PolicyNumber,
        //     "companyName": userInfo.Employer,
        //     "policyStatus": userInfo.policyDetails.PolicyStatus,
        //     "planName": "PlanA",
        //     "planDate": "04-04-2018"
        // },
        // "chatHistory" : cLog
    };

    let cookie =  globalCookie && globalCookie != "" ? globalCookie : "BMAID=fcc21332-a886-47bf-a02b-251852ecabf1; CoreID6=26830750548215230014819&ci=50200000|DBA_50200000|Digital Business Automation on Cloud Login; com.ibm.bpm.saas.user=aswini.ibmbpm@gmail.com; lombardi.locale.name=en; CoreM_State=9~-1~-1~-1~-1~3~3~5~3~3~7~7~|~~|~~|~~|~||||||~|~~|~~|~~|~~|~~|~~|~~|~; CoreM_State_Content=6~|~~|~|; utag_main=v_id:016299f64865001c0ff10fa9e99f04073001d06b0086e$_sn:1$_ss:0$_st:1523003381273$ses_id:1523001477223%3Bexp-session$_pn:3%3Bexp-session$mm_sync:1%3Bexp-session$dc_visit:1$dc_event:2%3Bexp-session$dc_region:eu-central-1%3Bexp-session; 50200000_clogin=v=1&l=27645541523001481961&e=1523003384571; com.ibm.bpm.servlet.LaunchDashboardServlet.defaultAvatarKey=946681200000; ibm.bpm.timezoneOffset=-330; BAYEUX_BROWSER=de461b2xt0bn5oa38jfnnyw5e17wm; PD-S-SESSION-ID=hYFcfR1dDb3hhaR35844PQ==:1_2_1_tNNsqMQmddQn75Y5B6Fg5ye2LHdnJZ9x5Qv3wqwPAyDs4naO|; PD-ID=nPMEYBksihwbIH9S34siOcqTrQNw5Bmwb88+8mYfKhw04Fz3Fz47111z1KKLzC1JJp4fA5cpCT/T/n/uBLDkhlUmurMF3JO/qE40Fw4ctiOIwt2B7dV8OtPGtTc4G2Db40JO52yZKodY9NoI/eVokKKsDqmNn9vXmBpQqQGe51Yguuq5B6WmuA=="

    apiService.callApi(serviceNowUrl, "POST", reqBody, cookie)
        .then(body => {
            console.log('SUCCESS', body);
        })
        .catch(err => {
            console.log('BPM Call failed', err);
        })
}

module.exports = action;