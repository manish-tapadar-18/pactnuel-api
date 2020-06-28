import userModel from "./userModel";

const uniqid = require('uniqid');
import {knex} from "../config/config";
import publicationModel from './publicationModel';
const _ = require('lodash');


//get PUBLICATION wise data
exports.getDetail = async (alias) => {
    try {
      let query = knex.from('c_publication')
        .innerJoin('c_user', 'c_publication.AUTHOR_BY', 'c_user.ID')
        .leftJoin('c_file as AVATAR', 'c_publication.AVATAR', 'AVATAR.ID')
        .leftJoin('c_file as LOGO', 'c_publication.LOGO', 'LOGO.ID')
        .where({'c_publication.ALIAS':alias});

      let data = {};
      data.DETAILS = await query.select('c_publication.*','AVATAR.PATH as AVATAR_FILE_PATH',
        'LOGO.PATH as LOGO_FILE_PATH','c_user.NAME as AUTHOR_FIRST_NAME','c_user.LAST_NAME as AUTHOR_LAST_NAME');
      data.WRITERS = await knex.from('c_publication_user')
        .select('c_publication_user.*','c_user.NAME as AUTHOR_FIRST_NAME','c_user.EMAIL as EMAIL','c_user.LAST_NAME as AUTHOR_LAST_NAME')
        .innerJoin('c_user', 'c_publication_user.USER_ID', 'c_user.ID')
        .where({'c_publication_user.PUBLICATION_ID':data.DETAILS[0].ID});
      return data;
    }
    catch (e) {
      return e;
    }



};

exports.getDetailById = async (id) => {
    try {
      let query = knex.from('c_publication')
        .innerJoin('c_user', 'c_publication.AUTHOR_BY', 'c_user.ID')
        .leftJoin('c_file as AVATAR', 'c_publication.AVATAR', 'AVATAR.ID')
        .leftJoin('c_file as LOGO', 'c_publication.LOGO', 'LOGO.ID')
        .where({'c_publication.ID':id}).first();

      let data = {};
      data = await query.select('c_publication.*','AVATAR.PATH as AVATAR_FILE_PATH',
        'LOGO.PATH as LOGO_FILE_PATH','c_user.NAME as AUTHOR_FIRST_NAME','c_user.LAST_NAME as AUTHOR_LAST_NAME');

      return data;
    }
    catch (e) {
      return e;
    }



};

exports.getUsersPublication = async (userId) => {
  try{
    let data = await knex.from('c_publication_user')
      .select('c_publication_user.*','c_user.NAME as WRITER_FIRST_NAME','c_user.LAST_NAME as WRITER_LAST_NAME',
        'c1.NAME as AUTHOR_FIRST_NAME','c1.LAST_NAME as AUTHOR_LAST_NAME',
      'c_publication.TITLE','c_publication.DESCRIPTION','c_publication.TAG_LINE','c_publication.ALIAS',
        'AVATAR.PATH as AVATAR_FILE_PATH',
        'LOGO.PATH as LOGO_FILE_PATH')
      .innerJoin('c_user', 'c_publication_user.USER_ID', 'c_user.ID')
      .innerJoin('c_publication', 'c_publication_user.PUBLICATION_ID', 'c_publication.ID')
      .leftJoin('c_file as AVATAR', 'c_publication.AVATAR', 'AVATAR.ID')
      .leftJoin('c_file as LOGO', 'c_publication.LOGO', 'LOGO.ID')
      .innerJoin('c_user as c1', 'c_publication.AUTHOR_BY', 'c1.ID')
      .where({'c_publication_user.USER_ID':userId});
    return data;
  }
  catch (e) {
    return e;
  }

}

exports.createPublication = async (context,dataset) => {

  const trx =  await knex.transaction();
  try {
    let writers = dataset.WRITERS;
    delete dataset.WRITERS;
    dataset.ALIAS = await publicationModel.generateAlias(dataset.TITLE);
    await trx('c_publication').insert([dataset]);

    await trx('c_publication_user').insert([{
      ID: uniqid(),
      PUBLICATION_ID:dataset.ID,
      USER_ID:dataset.AUTHOR_BY,
      TYPE:'OWNER',
    }]);
    for(let i=0; i< writers.length; i++){
      await trx('c_publication_user').insert([{
        ID: uniqid(),
        PUBLICATION_ID:dataset.ID,
        USER_ID:writers[i].USER_ID,
        TYPE:writers[i].TYPE,
      }]);
    }
    trx.commit();
    return dataset.ID;
  }
  catch (e) {
    trx.rollback();
    throw e;
  }


};

exports.updatePublication = async (context,id,dataset) => {
  const trx =  await knex.transaction();
  try {
    let writers = dataset.WRITERS;
    delete dataset.WRITERS;
    //dataset.ALIAS = await publicationModel.generateAlias(dataset.TITLE,id);
    dataset.UPDATED_AT = new Date();
    await trx('c_publication').where({
      ID: id
    }).update(dataset);

    let previousWriters = await knex.select('c_publication_user.*').from('c_publication_user')
      .where({ "c_publication_user.PUBLICATION_ID": id,"c_publication_user.TYPE":"WRITER"});
    for(let i=0; i< previousWriters.length; i++){
      let checkExists = writers.indexOf(previousWriters[i].USER_ID);
      if(checkExists == -1){
        await trx('c_publication_user').where({
          ID: previousWriters[i].ID
        }).delete();
      }
      else{
        writers.splice(checkExists,1)
      }
    }
    for(let p = 0; p < writers.length; p++){
      if(writers[p].TYPE == 'WRITER'){
        await trx('c_publication_user').insert([{
          ID: uniqid(),
          PUBLICATION_ID:id,
          USER_ID:writers[p].USER_ID,
          TYPE:writers[p].TYPE,
        }]);
      }

    }
    trx.commit();
    return id;
  }
  catch (e) {
    trx.rollback();
    throw e;
  }

};

exports.getAll = async (req, skip, take, filters) => {
  try {
    let data = {};
    let query = knex.from('c_publication')
      .innerJoin('c_user', 'c_publication.AUTHOR_BY', 'c_user.ID')
      .leftJoin('c_file as AVATAR', 'c_publication.AVATAR', 'AVATAR.ID')
      .leftJoin('c_file as LOGO', 'c_publication.LOGO', 'LOGO.ID')
      .where({ });

    if (filters) {
      query = publicationModel.generateFilters(query, filters);
    }
    data.DATA = await query.offset(skip).limit(take).distinct('c_publication.*','AVATAR.PATH as AVATAR_FILE_PATH',
      'LOGO.PATH as LOGO_FILE_PATH','c_user.NAME as AUTHOR_FIRST_NAME','c_user.LAST_NAME as AUTHOR_LAST_NAME');
    let totalCount = await publicationModel.getCount(filters);
    data.TOTAL = totalCount[0].COUNT;
    return data;
  }
  catch (e) {
    return e;
  }

};

exports.getCount = async (filters) => {
  try {
    let query = knex.from('c_publication')
      .innerJoin('c_user', 'c_publication.AUTHOR_BY', 'c_user.ID')
      .leftJoin('c_file as AVATAR', 'c_publication.AVATAR', 'AVATAR.ID')
      .leftJoin('c_file as LOGO', 'c_publication.LOGO', 'LOGO.ID')
      .where({ });
    if (filters) {
      query = publicationModel.generateFilters(query, filters);
    }
    return await query.count({ 'COUNT': 'c_publication.ID' });
  }
  catch (e) {
    return e;
  }

};

exports.generateAlias = async (name,id=0) => {
  try{

    let alias = name.replace(/[^A-Z0-9]+/ig, '-');
    let result = await knex.select('c_publication.ALIAS')
      .from('c_publication')
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

exports.generateFilters = function (query, filters) {
  let dateFields = ['CREATED_AT', 'UPDATED_AT'];
  let sort = filters.sortFilter;
  let tableName = query._single.table;
  if(sort != undefined || sort != null){
    query.orderBy(sort.FIELD_NAME,sort.SORT_ORDER).orderBy(tableName+'.ID','DESC');
  }
  else{
    query.orderBy(tableName+'.CREATED_AT','DESC').orderBy(tableName+'.ID','DESC');
  }
  if(filters.search != undefined){
    for (let i = 0; i < filters.search.length; i++) {
      //check the fieldname with table name or not
      let fieldwithTableName = filters.search[i].FIELD_NAME.split('.');
      if (filters.search[i].FIELD_VALUE != null && filters.search[i].FIELD_VALUE != '') {
        if (filters.search[i].OPT == 'LIKE') {
          query = query.where(filters.search[i].FIELD_NAME, filters.search[i].OPT, '%' + filters.search[i].FIELD_VALUE + '%');
        } else if (dateFields.indexOf(filters.search[i].FIELD_NAME) != -1 || dateFields.indexOf(fieldwithTableName[1]) != -1) {
          let startDate = filters.search[i].FIELD_VALUE + ' 00:00:00';
          let endDate = filters.search[i].FIELD_VALUE + ' 23:59:59';
          query = query.whereBetween(filters.search[i].FIELD_NAME, [new Date(startDate), new Date(endDate)]);
        } else {
          query = query.where(filters.search[i].FIELD_NAME, filters.search[i].OPT, filters.search[i].FIELD_VALUE);
        }
      }
    }
  }

  return query;
};

exports.checkPublicationUser = async (userId,publicationId) => {
  try{
    let result = await knex.select('*')
      .from('c_publication_user').where({ "USER_ID": userId,"PUBLICATION_ID": publicationId,"TYPE":"WRITER"});
    if (result.length == 0) {
      return null;
    }

    return result[0];
  }catch (e) {
    return e.message;
  }


};

exports.removeWriter = async (userId,publicationId) => {
  try{

    await knex('c_publication_user').where({
      USER_ID: userId,
      PUBLICATION_ID: publicationId,
    }).delete();

    return 'success';

  }catch (e) {
    return e.message;
  }


};

exports.menuPublication = async (id,status) => {
  try{

    await knex('c_publication').where({
      ID: id
    }).update({
      SHOW_ON_MENU:status
    });

    return 'success';

  }catch (e) {
    return e;
  }


};
