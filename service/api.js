'use strict';

const request = require('request');

module.exports.callApi = (url, method, body) =>{

    let options = {
        method : method,
        url: url,
        headers: {
            'Authorization': 'Basic ' + new Buffer('wpcadmin:wpcadmin').toString('base64')
        }
    };
    if (method == "POST" && body){
        options.body = body;
    }
    console.log('POLPOL', options);
    return new Promise((resolve, reject) =>{
        request(options, function (err, response, body) {
            console.log('RESPONSE', err, body);
            if (err){
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};