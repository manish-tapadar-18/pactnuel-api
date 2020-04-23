// Dependencies
import express from "express";
import userController from "../controller/UserController";
import fileController from "../controller/FileController";
import categoryController from "../controller/CategoryController";
import tagController from "../controller/TagController";
import middleware from "../middleware";

const router = express.Router();

// Routes
router.route("/").get((req, res) => res.status(200).send("Hola!!! You are one step away from Pactnuel API"));

router.use(middleware.checkFormatKey);

//User API
router.route("/login").post(middleware.checkFormatKey,userController.login);
router.route("/register").post(middleware.checkFormatKey,userController.register);
router.route("/userDetails").post(middleware.checkFormatKey,userController.getDetails);


//File API
router.route("/uploadFile").post(middleware.checkUserAuth,fileController.uploadFile);

//category API
router.route("/addCategory").post(middleware.checkUserAuth,categoryController.addCategory);
router.route("/getAllCategory").get(middleware.checkUserAuth,categoryController.getAllCategory);
router.route("/updateCategory/:id").put(middleware.checkUserAuth,categoryController.updateCategory);
router.route("/getCategory/:id").get(middleware.checkUserAuth,categoryController.getCategory);


//tags API
router.route("/addUpdateTags").post(middleware.checkUserAuth,tagController.addUpdateTags);
router.route("/getAllTags").get(middleware.checkUserAuth,tagController.getAllTags);
router.route("/getTags/:id").get(middleware.checkUserAuth,tagController.getTag);



export default router;
