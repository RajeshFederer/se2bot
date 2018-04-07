'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
global.cusInfo = {};
global.chatLog = {};
global.globalCookie = "";
let action = require('./lib/action');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.post('/', (req, res) => {
  console.log('ACTION NAME ', req.body.result.action);
  if (req.body.result.action == "getPolicyInvalid") {
    return action["getPolicyInfo"](req, res);
  } else {
    return action[req.body.result.action](req, res);
  }
});

app.post('/cookie', (req, res) => {
  if (res.body.cookie) {
    globalCookie = res.body.cookie;
    return res.json({ message: "Success" })
  } else {
    return res.json({ message: "Provide Cookie" })
  }
});

app.get('/image/presentMarket', function (req, res) {
  res.sendFile(path.join(__dirname, '/images/presentMarket.jpg'));
});

app.listen(port, function () {
  console.log('AGENT is running my app on  PORT: ' + port);
});