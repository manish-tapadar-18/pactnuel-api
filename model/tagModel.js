const uniqid = require('uniqid');
import {knex} from "../config/config";
import tagModel from "./tagModel"

//get UserID wise data
exports.getDetail = async (id) => {
  try{
    let result = await knex.select('c_tags.*')
      .from('c_tags')
      .where({ "ID": id}).limit(1);
    if (result.length == 0) {
      return null;
    }

    return result[0];
  }catch (e) {
    throw e;
  }


};

exports.createUpdateTags = async (context,dataset) => {

  // Save Category
  try {
    let result = await knex.select('c_tags.*')
      .from('c_tags')
      .where({ "NAME": dataset.NAME}).limit(1);
    if (result.length == 0) {
      await knex('c_tags').insert([dataset]);
      return dataset.ID;
    }
    else{
      return result[0].ID;
    }

  }
  catch (e) {
    console.log(e.message)
    throw e;
  }


};

exports.getAll = async (req) => {
  try{
    let result = await knex.select('c_tags.*')
      .from('c_tags')
      .where({});
    if (result.length == 0) {
      return null;
    }

    return result;
  }catch (e) {
    throw e;
  }


};



