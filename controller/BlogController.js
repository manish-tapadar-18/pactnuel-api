import helpers from "../helpers";
import {config} from "dotenv";
import blogModel from '../model/blogModel';
import uniqid from 'uniqid';
import publicationModel from "../model/publicationModel";
import publication from "./PublicationController";
import {knex} from "../config/config";

config();

let blog = {};
blog.addBlog  = async (req,res) =>{
  try{

    let payload = req.body;
    let desc = typeof (payload.DESCRIPTION) === "string" && payload.DESCRIPTION.trim().length > 0? payload.DESCRIPTION : null;
    let title = typeof (payload.TITLE) === "string" && payload.TITLE.trim().length > 0? payload.TITLE : false;
    let authorBy = typeof (payload.AUTHOR_BY) === "string" && payload.AUTHOR_BY.trim().length > 0? payload.AUTHOR_BY : false;
    let status = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0? payload.STATUS : false;
    let publication = typeof (payload.PUBLICATION) === "string" && payload.PUBLICATION.trim().length > 0? payload.PUBLICATION : null;
    let category = payload.CATEGORIES.length > 0 ? payload.CATEGORIES : [];
    let tags = payload.TAGS.length > 0 ? payload.TAGS : [];
    let content = typeof (payload.CONTENT) === "object"? payload.CONTENT : false;
    let featureMedia = typeof (payload.FEATURE_MEDIA) === "object"? payload.FEATURE_MEDIA : {};
    //check tags are duplicate or not
    // validation
    if(title && authorBy  && status && content) {
      payload.ID = uniqid();
      payload.STATUS = status;
      payload.PUBLICATION = publication;
      payload.FEATURE_MEDIA = JSON.stringify(featureMedia);
      payload.DESCRIPTION = desc;
      payload.TITLE = title;
      payload.AUTHOR_BY = authorBy;
      payload.TAGS = tags;
      payload.CATEGORIES = category;
      payload.CONTENT = JSON.stringify(content);
      let blogDetails = await blogModel.createBlog(req, payload);
      if(blogDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(201).json(helpers.response("201", "success", "blogDetails Added!", {DATA:blogDetails}));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }
};

blog.getBlog = async (req,res) => {
  try{
    if (!req.params.alias) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await blogModel.getDetail(req.params.alias);

    if(getDetials != null){
      res.status(200).json(helpers.response("200", "success", "Fetch Successful",getDetials));
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Fetch is not possible!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

blog.getAllBlog = async (req,res) => {
  try {
    let skip = req.query.skip ? req.query.skip : 0;
    let take = req.query.take ? req.query.take : 50;
    let filters = typeof (req.body.filters) === "object" ? req.body.filters : [];
    let data = await blogModel.getAll(req,skip,take,filters);
    if (data != null) {
      res.status(200).json(helpers.response("200", "success", "Fetch Successful", data));
    }
    else {
      res.status(200).json(helpers.response("200", "error", "Fetch is not possible!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

blog.updateBlog = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }


    let payload = req.body;
    let desc = typeof (payload.DESCRIPTION) === "string" && payload.DESCRIPTION.trim().length > 0? payload.DESCRIPTION : '';
    let title = typeof (payload.TITLE) === "string" && payload.TITLE.trim().length > 0? payload.TITLE : false;
    let authorBy = typeof (payload.AUTHOR_BY) === "string" && payload.AUTHOR_BY.trim().length > 0? payload.AUTHOR_BY : false;
    let status = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0? payload.STATUS : false;
    let publication = typeof (payload.PUBLICATION) === "string" && payload.PUBLICATION.trim().length > 0? payload.PUBLICATION : '';
    let category = payload.CATEGORIES.length > 0 ? payload.CATEGORIES : [];
    let tags = payload.TAGS.length > 0 ? payload.TAGS : [];
    let content = typeof (payload.CONTENT) === "object"? payload.CONTENT : false;
    let featureMedia = typeof (payload.FEATURE_MEDIA) === "object"? payload.FEATURE_MEDIA : {};
    //check tags are duplicate or not
    // validation
    if(title && authorBy  && status && content) {
      payload.STATUS = status;
      payload.PUBLICATION = publication;
      payload.FEATURE_MEDIA = JSON.stringify(featureMedia);
      payload.DESCRIPTION = desc;
      payload.TITLE = title;
      payload.AUTHOR_BY = authorBy;
      payload.TAGS = tags;
      payload.CATEGORIES = category;
      payload.CONTENT = JSON.stringify(content);
      let blogDetails = await blogModel.updateBlog(req,req.params.id, payload);
      if(blogDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(200).json(helpers.response("201", "success", "blogDetails Updated!", {DATA:blogDetails}));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }

};

blog.markTop = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let topCount = await knex.select('*')
      .from('c_blog')
      .where({ "TOP": 1});

    if(topCount.length < 5){
      let getDetails = await blogModel.getDetailById(req.params.id);
      if(getDetails != null){
        if(getDetails.TOP == 0){
          getDetails.TOP = 1;
        }
        else {
          getDetails.TOP =0;
        }
        let status = await blogModel.markTop(req.params.id,getDetails.TOP);
        if(status != null){
          res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
        }
        else{
          res.status(200).json(helpers.response("200", "error", "Update is not possible!"));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Blog doesn't exists!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "You have marked 5 blogs already! Please remove some blog to mark a new one"));

    }

  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }

};

blog.markFeatured = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let topCount = await knex.select('*')
      .from('c_blog')
      .where({ "FEATURED": 1});

    if(topCount.length < 5){
      let getDetails = await blogModel.getDetailById(req.params.id);
      if(getDetails != null){
        if(getDetails.FEATURED == 0){
          getDetails.FEATURED = 1;
        }
        else {
          getDetails.FEATURED =0;
        }
        let status = await blogModel.markFeatured(req.params.id,getDetails.FEATURED);
        if(status != null){
          res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
        }
        else{
          res.status(200).json(helpers.response("200", "error", "Update is not possible!"));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Blog doesn't exists!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "You have marked 5 blogs already! Please remove some blog to mark a new one"));

    }




  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

blog.updateViewsCount = async (req,res) => {
  try{
    if (!req.params.alias) {
      res.status(400);
      res.end();
      return;
    }
    let getDetails = await blogModel.getDetail(req.params.alias);
    if(getDetails != null && getDetails.STATUS  == 'PUBLISHED'){
      let status = await blogModel.updateViewsCount(req.params.alias,getDetails.VIEWS);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Update is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Blog doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};




export default blog;

