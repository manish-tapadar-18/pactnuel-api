const uniqid = require('uniqid');
import {knex} from "../config/config";

//get UserID wise data
exports.getDetail = async (ID) => {
  try{
    let result = await knex.select('*')
      .from('c_file').where({ "ID": ID}).limit(1);
    if (result.length == 0) {
      return null;
    }

    return result[0];
  }catch (e) {
    return e.message;
  }


};

exports.createFile = async (context,dataset) => {

  // Save File
  try {
    await knex('c_file').insert([{
      ID: dataset.ID,
      PATH:dataset.PATH,
      MIME_TYPE:dataset.MIME_TYPE
    }]);

    return dataset.ID;
  }
  catch (e) {
    return null;
  }


};


