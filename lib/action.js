let action = {};


action.getPolicyInfo = (req, res) => {
    console.log('IN GETPOLICYINFO');
    let policyNo;
    let parameters = req.body.result.parameters;
    if(parameters.policyInfo){
      policyNo = parameters.policyInfo;
    }
    let resMsg = {
      speech: '',
      messages: [
        {
          "type": 0,
          "platform": "facebook",
          "speech": "Hi Fredrick Gonsalves, Here are your existing Portfolio details for variable annuity policy No "+policyNo + " </br></br> Alamere Equity Income</br> Alamere Money Market."
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
  }

  module.exports = action;