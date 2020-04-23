const uniqid = require('uniqid');
import {knex} from "../config/config";

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

exports.createUser = async (context,dataset) => {
  // Save User
  const trx =  await knex.transaction();
  try {
    await trx('c_user').insert([{
      ID: dataset.ID,
      EMAIL:dataset.EMAIL,
      ROLE:dataset.ROLE,
      NAME:dataset.NAME,
      PASSWORD:dataset.PASSWORD,
    }]);
    trx.commit();
    return dataset.ID;
  }
  catch (e) {
    trx.rollback();
    throw e;
  }


};


