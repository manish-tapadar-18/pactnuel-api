import userModel from "./userModel";
const uniqid = require('uniqid');
import {knex} from "../config/config";
import categoryModel from "./categoryModel";

//get UserID wise data
exports.getDetail = async (email) => {
  const dbTransaction = await knex.transaction;
  try{
    let result = await knex.select('*')
      .from('c_user').where({ "EMAIL": email}).limit(1);
    if (result.length == 0) {
      return null;
    }
    return result[0];
  }catch (e) {
    throw e
  }
};

exports.getDetailFromMobile = async (mobile) => {
  const dbTransaction = await knex.transaction;
  try{
    let result = await knex.select('*')
      .from('c_user').where({ "MOBILE": mobile}).limit(1);
    if (result.length == 0) {
      return null;
    }
    return result[0];
  }catch (e) {
    throw e
  }
};

exports.createUser = async (context,dataset) => {
  // Save User
  const trx =  await knex.transaction();
  try {
    dataset.ALIAS = await userModel.generateAlias(dataset.EMAIL);
    await trx('c_user').insert([{
      ID: dataset.ID,
      EMAIL:dataset.EMAIL,
      ROLE:dataset.ROLE,
      PASSWORD:dataset.PASSWORD,
      NAME:dataset.NAME,
      LAST_NAME:dataset.LAST_NAME,
      SOURCE:dataset.SOURCE,
      MOBILE:dataset.MOBILE,
      REGISTRATION_TYPE:dataset.REGISTRATION_TYPE,
      GOOGLE_ID:dataset.GOOGLE_ID,
      FACEBOOK_ID:dataset.FACEBOOK_ID,
      ALIAS:dataset.ALIAS,
      REMEMBER_TOKEN:dataset.REMEMBER_TOKEN
    }]);
    trx.commit();
    return dataset.ID;
  }
  catch (e) {
    trx.rollback();
    throw e;
  }


};


exports.generateAlias = async (email,id=0) => {
  try{
    let aliasArray = email.split('@');
    let alias = aliasArray[0];
    let result = await knex.select('c_user.ALIAS')
      .from('c_user')
      .whereNot('ID',id)
      .where('ALIAS','LIKE','%'+alias+'%');
    if (result.length != 0) {
      alias = alias + '-'+(result.length)
    }

    return alias;
  }catch (e) {
    return e;
  }


};


exports.accountActivation = async (email) => {
  try {
    let dataset = {};
    dataset.EMAIL_VERIFY = 1;
    dataset.UPDATED_AT = new Date();
    await knex('c_user').where({
      EMAIL: email
    }).update(dataset);

    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};

exports.updateToken = async (email,token) => {
  try {
    let dataset = {};
    dataset.REMEMBER_TOKEN = token;
    dataset.UPDATED_AT = new Date();
    await knex('c_user').where({
      EMAIL: email
    }).update(dataset);

    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};

exports.updatePassword = async (email,password) => {
  try {
    let dataset = {};
    dataset.PASSWORD = password;
    dataset.UPDATED_AT = new Date();
    await knex('c_user').where({
      EMAIL: email
    }).update(dataset);

    return 'success'
  }
  catch (e) {
    console.log(e.message);
    throw e;
  }
};