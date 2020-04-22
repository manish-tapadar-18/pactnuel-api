const uniqid = require('uniqid');
import {knex} from "../config/config";

//get UserID wise data
exports.getDetail = async (email) => {
  try{
    let result = await knex.select('*')
      .from('c_user').where({ "EMAIL": email}).limit(1);
    if (result.length == 0) {
      return null;
    }

    return result[0];
  }catch (e) {
    throw e;
  }


};

exports.createUser = async (context,dataset) => {
  // Save User
  try {
    await knex('c_user').insert([{
      ID: dataset.ID,
      EMAIL:dataset.EMAIL,
      ROLE:dataset.ROLE,
      NAME:dataset.NAME,
      PASSWORD:dataset.PASSWORD,
    }]);
    return dataset.ID;
  }
  catch (e) {
    throw e;
  }


};


