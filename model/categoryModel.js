const uniqid = require('uniqid');
import {knex} from "../config/config";

//get UserID wise data
exports.getDetail = async (id) => {
  try{
    let result = await knex.select('c_category.*','i1.PATH as IMAGE_PATH')
      .from('c_category')
      .innerJoin('c_file as i1','i1.ID','c_category.IMAGE_ID')
      .where({ "c_category.ID": id}).limit(1);
    if (result.length == 0) {
      return null;
    }

    return result[0];
  }catch (e) {
    return e.message;
  }


};

exports.createCategory = async (context,dataset) => {

  // Save Category
  try {
    await knex('c_category').insert([dataset]);
    return dataset.ID;
  }
  catch (e) {
    console.log(e.message)
    return null;
  }


};
exports.updateCategory = async (context,id) => {
  try {
    await knex('c_category').where({
      ID: id
    }).update({
      IS_DELETED: '1',
      UPDATED_AT: new Date()});
    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};

exports.getAll = async (req) => {
  try{
    let result = await knex.select('c_category.*','i1.PATH as IMAGE_PATH')
      .from('c_category')
      .innerJoin('c_file as i1','i1.ID','c_category.IMAGE_ID')
      .where({});
    if (result.length == 0) {
      return null;
    }

    return result;
  }catch (e) {
    return e.message;
  }


};



