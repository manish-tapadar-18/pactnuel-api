import helpers from "../helpers";
import {config} from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import userModel from '../model/userModel';
import uniqid from 'uniqid';
const md5 = require('md5');


config();

let user = {};
user.register = async (req,res) => {
  try{
    let payload = req.body;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    let password = typeof (payload.PASSWORD) === "string" && payload.PASSWORD.trim().length > 0? payload.PASSWORD : false;
    let firstName = typeof (payload.FIRST_NAME) === "string" && payload.FIRST_NAME.trim().length > 0? payload.FIRST_NAME : false;
    let lastName = typeof (payload.LAST_NAME) === "string" && payload.LAST_NAME.trim().length > 0? payload.LAST_NAME : false;
    let source = typeof (payload.SOURCE) === "string" && payload.SOURCE.trim().length > 0? payload.SOURCE : null;
    let mobile = typeof (payload.MOBILE) === "string" && payload.MOBILE.trim().length > 0? payload.MOBILE : null;
    let loginType = typeof (payload.REGISTRATION_TYPE) === "string" && payload.REGISTRATION_TYPE.trim().length > 0? payload.REGISTRATION_TYPE : 'EMAIL';
    let facebookId = typeof (payload.GOOGLE_ID) === "string" && payload.GOOGLE_ID.trim().length > 0? payload.GOOGLE_ID : null;
    let googleId = typeof (payload.FACEBOOK_ID) === "string" && payload.FACEBOOK_ID.trim().length > 0? payload.FACEBOOK_ID : null;
    let role = typeof (payload.ROLE) === "object" && payload.ROLE.ROLES.length > 0? payload.ROLE : false;

    if(email && password && role && firstName && lastName && loginType){
      let userDetails = await userModel.getDetail(email);
      let userDetailsMobile = null;
      if(mobile != null){
        userDetailsMobile = await userModel.getDetailFromMobile(mobile);
      }

      if(userDetails == null && userDetailsMobile == null){
        let userId = uniqid();
        let dataSet = {
          ID:userId,
          NAME:firstName,
          LAST_NAME:lastName,
          ROLE:JSON.stringify(role),
          EMAIL:email,
          MOBILE:mobile,
          PASSWORD:md5(password),
          SOURCE:source,
          REGISTRATION_TYPE:loginType,
          GOOGLE_ID:googleId,
          FACEBOOK_ID:facebookId
        };
        //create user
        let createdUser = await userModel.createUser(req,dataSet);
        if(createdUser != null){
          delete dataSet.PASSWORD;
          dataSet.EXP = Math.floor(Date.now() / 1000) + (60 * 60 * 2 * 100);
          jwt.sign(dataSet, helpers.hash(process.env.APP_SUPER_SECRET_KEY), function (err, token) {
            if (!err && token) {
              dataSet.ACCESS_TOKEN = token;
              //AUTHENTICATED
              user.postAuth(dataSet).then((updateData) => {
                if (updateData.status) {
                  res.status(200).json(helpers.response("200", "success", "Login Successful", dataSet));
                } else {
                  res.status(500).json(helpers.response("500", "error", "Something went wrong", dataSet));
                }
              });
            } else {
              res.status(500).json(helpers.response("500", "error", "Something went wrong"));
            }
          });
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Your mobile/email is already registered with us, Please login!"));
      }

    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }


}

//frontend user login
user.login = async (req,res) => {
  try{
    let payload = req.body;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    let password = typeof (payload.PASSWORD) === "string" && payload.PASSWORD.trim().length > 0? payload.PASSWORD : false;
    if(email && password){
      //check mobile and otp is correct or not
        let userDetails = await userModel.getDetail(email);
        if(userDetails != null){
          if(userDetails.PASSWORD.toUpperCase() == (md5(password)).toUpperCase()){
            let rowsData = {};
            rowsData.ID = userDetails.ID;
            rowsData.EMAIL = userDetails.EMAIL;
            rowsData.NAME = userDetails.NAME;
            rowsData.COUNTRY_CODE = userDetails.COUNTRY_CODE;
            rowsData.LAST_NAME = userDetails.LAST_NAME;
            rowsData.MOBILE = userDetails.MOBILE;
            rowsData.REGISTRATION_TYPE = userDetails.REGISTRATION_TYPE;
            rowsData.GOOGLE_ID = userDetails.GOOGLE_ID;
            rowsData.ROLE = userDetails.ROLE;
            rowsData.FACEBOOK_ID = userDetails.FACEBOOK_ID;

            rowsData.EXP = Math.floor(Date.now() / 1000) + (60 * 60 * 2 * 100);
            jwt.sign(rowsData, helpers.hash(process.env.APP_SUPER_SECRET_KEY), function (err, token) {
              if (!err && token) {
                rowsData.ACCESS_TOKEN = token;
                //AUTHENTICATED
                user.postAuth(userDetails).then((updateData) => {
                  if (updateData.status) {
                    res.status(200).json(helpers.response("200", "success", "Login Successful", rowsData));
                  } else {
                    res.status(500).json(helpers.response("500", "error", "Something went wrong", rowsData));
                  }
                });
              } else {
                res.status(500).json(helpers.response("500", "error", "Something went wrong"));
              }
            });
          }
          else {
            res.status(200).json(helpers.response("200", "error", "Password not matched!"));
          }

        }
        else{
          res.status(200).json(helpers.response("200", "error", "Yor are not registered with us!"));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Validation Error!"));
      }

  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }

};

user.getDetails = async (req,res) => {
  try{
    let payload = req.body;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    if(email){
      //check mobile and otp is correct or not
      let userDetails = await userModel.getDetail(email);
      if(userDetails != null){
        delete userDetails.PASSWORD;
        res.status(200).json(helpers.response("200", "success", "Successful!", userDetails));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "User Not Found!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }

  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

//POST AUTH
/**
 *
 *
 * @param tokenObj
 * @returns {Promise<any>}
 */
user.postAuth = (tokenObj) => {
  return new Promise((resolve,reject) => {
    try{
      const updatedTokenObj = tokenObj;
      /**
       * Code here | override updatedTokenObj with your new logic & update this variable
       */
      delete updatedTokenObj.password;
      resolve(helpers.promiseResponse(true,updatedTokenObj)); //(code,status,message,data="")
    }catch(e){
      reject(helpers.promiseResponse(false));
    }
  });
};

export default user;

