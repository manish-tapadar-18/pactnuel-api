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
    let name = typeof (payload.NAME) === "string" && payload.NAME.trim().length > 0? payload.NAME : false;
    let role = typeof (payload.ROLE) === "object" && payload.ROLE.ROLES.length > 0? payload.ROLE : false;

    if(email && password && role && name){
      let userDetails = await userModel.getDetail(email);
      if(userDetails == null){
        let userId = uniqid();
        let dataSet = {
          ID:userId,
          NAME:name,
          ROLE:JSON.stringify(role),
          EMAIL:email,
          PASSWORD:md5(password)
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
        res.status(200).json(helpers.response("200", "error", "You are already registered with us, Please login!"));
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
            rowsData.EMAIL = userDetails.MOBILE;
            rowsData.NAME = userDetails.NAME;
            rowsData.COUNTRY_CODE = userDetails.COUNTRY_CODE;
            rowsData.ROLE = userDetails.ROLE;
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

