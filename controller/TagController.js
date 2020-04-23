import helpers from "../helpers";
import {config} from "dotenv";
import tagModel from '../model/tagModel';
import uniqid from 'uniqid';

config();

let tags = {};
tags.addUpdateTags  = async (req,res) =>{
  try{

    let payload = req.body;
    let name = typeof (payload.NAME) === "string" && payload.NAME.trim().length > 0? payload.NAME : false;
    if(name) {
      payload.ID = uniqid();
      payload.STATUS = 'active';
      let tagsDetails = await tagModel.createUpdateTags(req, payload);
      if(tagsDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(201).json(helpers.response("201", "success", "Tag Added!", {ID:tagsDetails}));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }
};


tags.getTag = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await tagModel.getDetail(req.params.id);

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

tags.getAllTags = async (req,res) => {
  try {
    let data = await tagModel.getAll(req);
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



export default tags;

