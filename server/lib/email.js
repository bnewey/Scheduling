var nodemailer = require('nodemailer');
const express = require('express');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const router = express.Router();

const logger = require('../../logs');

const oauth2Client = new OAuth2(
  "220099490036-0e1ekse83fmtbfl415j88r82vttaosmr.apps.googleusercontent.com", // ClientID
  "SYMJVaWy6qNn70qXcDkBHxYn", // Client Secret
  "https://icontrol.raineyelectronics.com/scheduling" // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: "1//04q2OBPyNU19lCgYIARAAGAQSNwF-L9IrdDq3HeyZPco0EWtEQMrF4HmT3HVSFNqAssNfK10OfjnTc8TOYQqOBhEjDG6hFuRUMx8"
});
const accessToken = oauth2Client.getAccessToken();

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: "OAuth2",
          user: "bnewey@raineyelectronics.com", 
          clientId: "220099490036-0e1ekse83fmtbfl415j88r82vttaosmr.apps.googleusercontent.com",
          clientSecret: "SYMJVaWy6qNn70qXcDkBHxYn",
          refreshToken: "1//04q2OBPyNU19lCgYIARAAGAQSNwF-L9IrdDq3HeyZPco0EWtEQMrF4HmT3HVSFNqAssNfK10OfjnTc8TOYQqOBhEjDG6hFuRUMx8",
          accessToken: accessToken
  }
});



const sendMail = (email, text) => {

    var mailOptions = {
        from: 'bnewey@raineyelectronics.com',
        to: `${email}`,
        subject: 'Icontrol Scheduler',
        text: `${text}`
      };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}


router.post('/email', async (req,res) => {
  var email, text;
  if(req.body){
      email = req.body.email;
      text = req.body.text;
  }

  

  try{
    sendMail(email, text);
    res.sendStatus(200);
  }
  catch(error){
      logger.error("SendMail (/email): " + error);
      res.sendStatus(400);
  }
});

module.exports = {
    sendMail: sendMail,
    emailRouter: router,
}