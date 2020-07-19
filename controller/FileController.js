//Dependencies
import {config} from "dotenv";

import helpers from "./../helpers";

import Busboy from "busboy";

import fs from "fs";

import uniqid from 'uniqid';

import fileModel from '../model/fileModel';


config();

let file = {};

//SAVE FILE IN S3 CLIENT
file.uploadFile = async (req, res) => {
  try{
    let auth = req.mwValue.auth;
    let busboy = new Busboy({headers: req.headers});
    busboy.on("file", async function (fieldname, file, filename, encoding, mimetype) {
      // path to file upload
      let ext = filename.split('.').pop();
      filename = uniqid()+'.'+ext;
      const saveTo = (__dirname+ "/../files/" + filename);
      await file.pipe(fs.createWriteStream(saveTo));

      let dataset = {
        ID: uniqid(),
        PATH:filename,
        MIME_TYPE:mimetype
      };
      let fileId = await fileModel.createFile(req,dataset);
      if(fileId != null){
        res.status(201).json(helpers.response("201", "success", "Successfully file added",dataset));
      }
      else{
        res.status(200).json(helpers.response("201", "error", "Database error!"));
      }
    });
    req.pipe(busboy);
  }catch (e) {
    res.status(500).json(helpers.response("500", "error", "Something went wrong", e));
  }
};



export default file;