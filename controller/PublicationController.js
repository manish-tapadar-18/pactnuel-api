import helpers from "../helpers";
import {config} from "dotenv";
import publicationModel from '../model/publicationModel';
import uniqid from 'uniqid';


config();

let publication = {};
publication.addPublication  = async (req,res) =>{
  try{

    let payload = req.body;
    let desc = typeof (payload.DESCRIPTION) === "string" && payload.DESCRIPTION.trim().length > 0? payload.DESCRIPTION : null;
    let tagline = typeof (payload.TAG_LINE) === "string" && payload.TAG_LINE.trim().length > 0? payload.TAG_LINE : null;
    let title = typeof (payload.TITLE) === "string" && payload.TITLE.trim().length > 0? payload.TITLE : false;
    let authorBy = typeof (payload.AUTHOR_BY) === "string" && payload.AUTHOR_BY.trim().length > 0? payload.AUTHOR_BY : false;
    let status = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0? payload.STATUS : false;
    let facebookInfo = typeof (payload.FACEBOOK_INFO) === "string" && payload.FACEBOOK_INFO.trim().length > 0? payload.FACEBOOK_INFO : null;
    let emailInfo = typeof (payload.EMAIL_INFO) === "string" && payload.EMAIL_INFO.trim().length > 0? payload.EMAIL_INFO : null;
    let twitterInfo = typeof (payload.TWITTER_INFO) === "string" && payload.TWITTER_INFO.trim().length > 0? payload.TWITTER_INFO : null;
    let instaInfo = typeof (payload.INSTAGRAM_INFO) === "string" && payload.INSTAGRAM_INFO.trim().length > 0? payload.INSTAGRAM_INFO : null;
    let logo = typeof (payload.LOGO) === "string" && payload.LOGO.trim().length > 0? payload.LOGO : null;
    let avatar = typeof (payload.AVATAR) === "string" && payload.AVATAR.trim().length > 0? payload.AVATAR : null;
    let writers = payload.WRITERS.length > 0 ? payload.WRITERS : [];


    //check tags are duplicate or not
    // validation
    if(title && authorBy  && status && desc && avatar) {
      payload.ID = uniqid();
      payload.STATUS = status;
      payload.TAG_LINE = tagline;
      payload.DESCRIPTION = desc;
      payload.TITLE = title;
      payload.AUTHOR_BY = authorBy;
      payload.FACEBOOK_INFO = facebookInfo;
      payload.EMAIL_INFO = emailInfo;
      payload.TWITTER_INFO = twitterInfo;
      payload.INSTAGRAM_INFO = instaInfo;
      payload.LOGO = logo;
      payload.WRITERS = writers;
      payload.AVATAR = avatar;
      let publicationDetails = await publicationModel.createPublication(req, payload);
      if(publicationDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(201).json(helpers.response("201", "success", "publicationDetails Added!", {ID:publicationDetails}));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }
};

publication.getPublication = async (req,res) => {
  try{
    if (!req.params.alias) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await publicationModel.getDetail(req.params.alias);

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

publication.getUsersPublication = async (req,res) => {
  try{
    if (!req.params.userId) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await publicationModel.getUsersPublication(req.params.userId);

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

publication.getAllPublication = async (req,res) => {
  try {
    let skip = req.query.skip ? req.query.skip : 0;
    let take = req.query.take ? req.query.take : 50;
    let filters = typeof (req.body.filters) === "object" ? req.body.filters : [];
    let data = await publicationModel.getAll(req,skip,take,filters);
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

publication.updatePublication = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }


    let payload = req.body;
    let desc = typeof (payload.DESCRIPTION) === "string" && payload.DESCRIPTION.trim().length > 0? payload.DESCRIPTION : null;
    let tagline = typeof (payload.TAG_LINE) === "string" && payload.TAG_LINE.trim().length > 0? payload.TAG_LINE : null;
    let title = typeof (payload.TITLE) === "string" && payload.TITLE.trim().length > 0? payload.TITLE : false;
    let authorBy = typeof (payload.AUTHOR_BY) === "string" && payload.AUTHOR_BY.trim().length > 0? payload.AUTHOR_BY : false;
    let status = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0? payload.STATUS : false;
    let facebookInfo = typeof (payload.FACEBOOK_INFO) === "string" && payload.FACEBOOK_INFO.trim().length > 0? payload.FACEBOOK_INFO : null;
    let emailInfo = typeof (payload.EMAIL_INFO) === "string" && payload.EMAIL_INFO.trim().length > 0? payload.EMAIL_INFO : null;
    let twitterInfo = typeof (payload.TWITTER_INFO) === "string" && payload.TWITTER_INFO.trim().length > 0? payload.TWITTER_INFO : null;
    let instaInfo = typeof (payload.INSTAGRAM_INFO) === "string" && payload.INSTAGRAM_INFO.trim().length > 0? payload.INSTAGRAM_INFO : null;
    let logo = typeof (payload.LOGO) === "string" && payload.LOGO.trim().length > 0? payload.LOGO : null;
    let avatar = typeof (payload.AVATAR) === "string" && payload.AVATAR.trim().length > 0? payload.AVATAR : null;
    let writers = payload.WRITERS.length > 0 ? payload.WRITERS : [];


    //check tags are duplicate or not
    // validation
    if(title && authorBy  && status && desc && avatar) {
      payload.STATUS = status;
      payload.TAG_LINE = tagline;
      payload.DESCRIPTION = desc;
      payload.TITLE = title;
      payload.AUTHOR_BY = authorBy;
      payload.FACEBOOK_INFO = facebookInfo;
      payload.EMAIL_INFO = emailInfo;
      payload.TWITTER_INFO = twitterInfo;
      payload.INSTAGRAM_INFO = instaInfo;
      payload.LOGO = logo;
      payload.WRITERS = writers;
      payload.AVATAR = avatar;
        let publicationDetails = await publicationModel.updatePublication(req,req.params.id, payload);
        if(publicationDetails == null){
          res.status(200).json(helpers.response("200", "error", "Database Error!"));
        }
        else{
          res.status(200).json(helpers.response("201", "success", "publicationDetails Updated!", {ID:publicationDetails}));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Validation Error!"));
      }
    }catch(e){
      res.status(500).json(helpers.response("500", "error", "Something went wrong"));
    }

};

publication.removePublication = async (req,res) => {
  try{
    if (!req.params.userId || !req.params.publicationId) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await publicationModel.checkPublicationUser(req.params.userId,req.params.publicationId);
    if(getDetials != null){
      let status = await publicationModel.removeWriter(req.params.userId,req.params.publicationId);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Delete is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Cant remove Owner/User doesn't exists!"));
    }

  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

publication.menuPublication = async (req,res) => {
  try{
    if (!req.params.publicationId) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await publicationModel.getDetailById(req.params.publicationId);
    if(getDetials != null){
      if(getDetials.SHOW_ON_MENU == 0){
        getDetials.SHOW_ON_MENU = 1;
      }
      else {
        getDetials.SHOW_ON_MENU =0;
      }
      let status = await publicationModel.menuPublication(req.params.publicationId,getDetials.SHOW_ON_MENU);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Update is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Publication doesn't exists!"));
    }

  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};


export default publication;

