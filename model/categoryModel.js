const uniqid = require('uniqid');
import {knex} from "../config/config";
import categoryModel from './categoryModel';

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
    dataset.ALIAS = await categoryModel.generateAlias(dataset.NAME);
    await knex('c_category').insert([dataset]);
    return dataset.ID;
  }
  catch (e) {
    console.log(e.message)
    return null;
  }


};
exports.updateCategory = async (context,id,dataset) => {
  try {
    dataset.USED_IN = JSON.stringify(dataset.USED_IN );
    dataset.ALIAS = await categoryModel.generateAlias(dataset.NAME,id);
    dataset.UPDATED_AT = new Date();
    await knex('c_category').where({
      ID: id
    }).update(dataset);
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

exports.generateAlias = async (name,id=0) => {
  try{
    let alias = name.replace(/[^\w\s]/gi, '-');
    let result = await knex.select('c_category.ALIAS')
      .from('c_category')
      .whereNot('ID',id)
      .where({'ALIAS':alias});
    if (result.length != 0) {
      alias = alias + '-'+(result.length)
    }

    return alias;
  }catch (e) {
    return e;
  }


};



