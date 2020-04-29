import userModel from "./userModel";

const uniqid = require('uniqid');
import {knex} from "../config/config";
import blogModel from './blogModel';

//get BLOG wise data
exports.getDetail = async (alias) => {
    try {
      let query = knex.from('c_blog')
        .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
        .innerJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
        .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
        .where({'c_blog.ALIAS':alias});

      let data = await query.select( 'c_user.*','c_blog.*',
        knex.raw("(select GROUP_CONCAT(ct.NAME) from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAG_NAME"),
        knex.raw("(select GROUP_CONCAT(ct.ID) from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAG_IDS"),
        knex.raw("(select GROUP_CONCAT(ct.NAME) from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORY_NAME"),
        knex.raw("(select GROUP_CONCAT(ct.ID) from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORY_IDS"));

      return data[0];
    }
    catch (e) {
      return e;
    }



};

exports.createBlog = async (context,dataset) => {

  const trx =  await knex.transaction();
  try {
    dataset.ALIAS = await blogModel.generateAlias(dataset.TITLE);
    await trx('c_blog').insert([{
      ID: dataset.ID,
      TITLE:dataset.TITLE,
      DESCRIPTION:dataset.DESCRIPTION,
      FEATURE_MEDIA:dataset.FEATURE_MEDIA,
      PUBLICATION:dataset.PUBLICATION,
      AUTHOR_BY:dataset.AUTHOR_BY,
      CONTENT:dataset.CONTENT,
      STATUS:dataset.STATUS,
      ALIAS:dataset.ALIAS,
    }]);

    for(let i=0; i< dataset.CATEGORIES.length; i++){
      await trx('c_blog_category').insert([{
        ID: uniqid(),
        BLOG_ID:dataset.ID,
        CATEGORY_ID:dataset.CATEGORIES[i],
      }]);
    }
    for(let j=0; j< dataset.TAGS.length; j++){
      await trx('c_blog_tag').insert([{
        ID: uniqid(),
        BLOG_ID:dataset.ID,
        TAG_ID:dataset.TAGS[j],
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

exports.updateBlog = async (context,id,dataset) => {
  try {
    dataset.USED_IN = JSON.stringify(dataset.USED_IN );
    dataset.ALIAS = await blogModel.generateAlias(dataset.NAME,id);
    dataset.UPDATED_AT = new Date();
    await knex('c_blog').where({
      ID: id
    }).update(dataset);
    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};

exports.getAll = async (req, skip, take, filters) => {
  try {
    let data = {};
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .innerJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .where({ });

    if (filters) {
      query = blogModel.generateFilters(query, filters);
    }
    data.DATA = await query.offset(skip).limit(take).distinct( 'c_user.*','c_blog.*',
      knex.raw("(select GROUP_CONCAT(ct.NAME) from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAG_NAME"),
      knex.raw("(select GROUP_CONCAT(ct.ID) from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAG_IDS"),
      knex.raw("(select GROUP_CONCAT(ct.NAME) from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORY_NAME"),
      knex.raw("(select GROUP_CONCAT(ct.ID) from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORY_IDS"));
    let totalCount = await blogModel.getCount(filters);
    data.TOTAL = totalCount[0].COUNT;
    return data;
  }
  catch (e) {
    return e;
  }

};

exports.getCount = async (filters) => {
  try {
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .innerJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .where({ });

    if (filters) {

      query = blogModel.generateFilters(query, filters);
    }
    return await query.count({ 'COUNT': 'c_blog.ID' });
  }
  catch (e) {
    return e;
  }

};

exports.generateAlias = async (name,id=0) => {
  try{
    let alias = name.replace(/[^A-Z0-9]+/ig, '-');
    let result = await knex.select('c_blog.ALIAS')
      .from('c_blog')
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