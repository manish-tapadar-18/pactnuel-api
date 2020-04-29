import helpers from "../helpers";
import {config} from "dotenv";
import blogModel from '../model/blogModel';
import uniqid from 'uniqid';

config();

let blog = {};
blog.addBlog  = async (req,res) =>{
  try{

    let payload = req.body;
    let desc = typeof (payload.DESCRIPTION) === "string" && payload.DESCRIPTION.trim().length > 0? payload.DESCRIPTION : '';
    let title = typeof (payload.TITLE) === "string" && payload.TITLE.trim().length > 0? payload.TITLE : false;
    let authorBy = typeof (payload.AUTHOR_BY) === "string" && payload.AUTHOR_BY.trim().length > 0? payload.AUTHOR_BY : false;
    let status = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0? payload.STATUS : false;
    let publication = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0? payload.STATUS : '';
    let category = payload.CATEGORIES.length > 0 ? payload.CATEGORIES : false;
    let tags = payload.TAGS.length > 0 ? payload.TAGS : [];
    let content = typeof (payload.CONTENT) === "object"? payload.CONTENT : false;
    let featureMedia = typeof (payload.FEATURE_MEDIA) === "object"? payload.FEATURE_MEDIA : {};
    //check tags are duplicate or not
    // validation
    if(title && authorBy  && status && category && content) {
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
        res.status(201).json(helpers.response("201", "success", "blogDetails Added!", {ID:blogDetails}));
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
      let publication = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0? payload.STATUS : '';
      let category = payload.CATEGORIES.length > 0 ? payload.CATEGORIES : false;
      let tags = payload.TAGS.length > 0 ? payload.TAGS : [];
      let content = typeof (payload.CONTENT) === "object"? payload.CONTENT : false;
      let featureMedia = typeof (payload.FEATURE_MEDIA) === "object"? payload.FEATURE_MEDIA : {};
      //check tags are duplicate or not
      // validation
      if(title && authorBy  && status && category && content) {
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
          res.status(200).json(helpers.response("201", "success", "blogDetails Updated!", {ID:blogDetails}));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Validation Error!"));
      }
    }catch(e){
      res.status(500).json(helpers.response("500", "error", "Something went wrong"));
    }

};



export default blog;

