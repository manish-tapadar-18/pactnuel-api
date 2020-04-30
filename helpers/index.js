//Dependencies

import crypto from "crypto";

import nodemailer from "nodemailer";

import ejs from "ejs";


import jwt from "jsonwebtoken";

import {config} from "dotenv";

import {knex} from "../config/config";

import _ from "lodash";

config();
let helpers = {};

helpers.parseJsonToObj = (str) => {
  try{
    return JSON.parse(str);
  }catch(e){
    return {};
  }
};

//hashing password
helpers.hash =  (str) => {
  if (typeof (str) === "string" && str.length > 0){
    return crypto.createHmac("sha256", process.env.APP_SUPER_SECRET_KEY).update(str).digest("hex");
  }else{
    return false;
  }
};

//token generator
helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) === "number" && strLength > 0 ? strLength : false;

  if(strLength){
    let text = "";
    let possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < strLength; i++)
      text += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
    return text;
  }else{
    return false;
  }
};

//Verify JWT Token
helpers.verifyToken = (id, callback) => {
  jwt.verify(id, helpers.hash(process.env.APP_SUPER_SECRET_KEY), function(err, data) {
    if(!err && data){
      callback(err, data);
    }else{
      callback(err, false);
    }
  });
};

//Generate Current Timestamp
helpers.currTimestamp = () => {
  let time = new Date().toISOString().slice(-13, -5).trim();
  let date = new Date().toISOString().split("T")[0];
  return date+" "+time;
};

//GMT timeStamp and timeString for mongo insert
helpers.utcTimeStamp =() =>{
  const date = new Date();
  const utc_string = date.toISOString();
  const utc_time_stamp = Math.round(new Date(utc_string).getTime());
  return {
    timeStamp:utc_time_stamp,
    timeString:utc_string
  };
};

//date time string to timeStamp [from database to store]
helpers.stringToTimestamp = (dateTimeString) =>{
  let date = new Date(dateTimeString);
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

// +- day from GMT/UTC time  || unit testing done
helpers.calcDate = (sign, opt ,value, optionalDateTime) => {
  let _date;
  if(sign === "+" || sign === "-"){
    if(optionalDateTime === undefined){
      _date = new Date();
    }else{
      _date = new Date(optionalDateTime);
    }
    let year = _date.getFullYear();
    let month = _date.getMonth();
    let  day = _date.getDate();

    let  hour = _date.getHours();
    let  minute = _date.getMinutes();
    let second = _date.getSeconds();

    switch(opt){
    case "year":
      year = (sign==="+") ? year+value : year-value;
      break;
    case "month":
      month = (sign==="+") ? month+value : month-value;
      break;
    case "day":
      day = (sign==="+") ? day+value : day-value;
      break;
    }

    if(optionalDateTime !== undefined){
      let hasOldDateObject = new Date(year,month,day,hour,minute,second);
      return `${hasOldDateObject.getFullYear()}-${hasOldDateObject.getMonth()+1}-${hasOldDateObject.getDate()} ${hasOldDateObject.getHours()}:${hasOldDateObject.getMinutes()}:${hasOldDateObject.getSeconds()}`;
    }else{
      let dateTimeString = new Date(year,month,day,hour,minute,second).toISOString();
      let time = dateTimeString.slice(-13, -5).trim();
      let date = dateTimeString.split("T")[0];
      return date+" "+time;
    }
  }else{
    return false;
  }
};

//Send Response
helpers.response = (code,status,message,data="") => {
  let response = {};
  if(code){
    response.code = code;
  }
  if(status){
    response.status = status;
  }
  if(message){
    response.message = message;
  }
  if(data){
    response.data = data;
  }
  return response;
};

//Send Promise Response
helpers.promiseResponse = (status,data="") =>{
  let response = {};
  if(typeof (status) === "boolean"){
    response.status = status;
  } else {
    response.status = false;
  }
  response.data = data;
  return response;
};
helpers.sendEmail = async function (tomailID, mailSubject, templateName, dataSet, attachments=[]) {

   const transporter = nodemailer.createTransport(
      {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME, // generated ethereal user
          pass: process.env.MAIL_PASSWORD // generated ethereal password
        }
      });

  let emailData = {};
  emailData.data = dataSet;
  ejs.renderFile(`templates/emails/${templateName}.ejs`,emailData, function (err, data) {
    if (!err) {
      const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: `${tomailID}`,
        subject: `${mailSubject}`,
        html: data
      };
      if(attachments.length > 0){
        mailOptions.attachments = attachments;
      }
      transporter.sendMail(mailOptions, function (error) {
        if (error) {
          throw new Error(error);
        }else{
          return 'Email sent'
        }
      });
    } else {
      throw new Error(err);
    }

  });
};

//export default helpers;
export default Object.assign(
  {},
  helpers
);
