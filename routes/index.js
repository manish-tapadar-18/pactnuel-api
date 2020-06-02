// Dependencies
import express from "express";
import userController from "../controller/UserController";
import fileController from "../controller/FileController";
import categoryController from "../controller/CategoryController";
import tagController from "../controller/TagController";
import blogController from "../controller/BlogController";
import publicationController from "../controller/PublicationController";
import followController from "../controller/FollowController";
import middleware from "../middleware";

const router = express.Router();

// Routes
router.route("/").get((req, res) => res.status(200).send("Hola!!! You are one step away from Pactnuel API"));

router.use(middleware.checkFormatKey);

//User API
router.route("/login").post(middleware.checkFormatKey,userController.login);
router.route("/register").post(middleware.checkFormatKey,userController.register);
router.route("/userDetails").post(middleware.checkFormatKey,userController.getDetails);
router.route("/accountActivation").post(middleware.checkFormatKey,userController.accountActivation);
router.route("/forgotPasswordResendActivation").post(middleware.checkFormatKey,userController.forgotPasswordResendActivation);
router.route("/forgotPassword").post(middleware.checkFormatKey,userController.forgotPassword);
router.route("/getAllUsers").post(middleware.checkFormatKey,userController.getAllUsers);



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

//blog API
router.route("/addBlog").post(middleware.checkUserAuth,blogController.addBlog);
router.route("/getAllBlog").post(middleware.checkUserAuth,blogController.getAllBlog);
router.route("/updateBlog/:id").put(middleware.checkUserAuth,blogController.updateBlog);
router.route("/getBlog/:alias").get(middleware.checkUserAuth,blogController.getBlog);
router.route("/markTopBlog/:id").put(middleware.checkUserAuth,blogController.markTop);
router.route("/markFeaturedBlog/:id").put(middleware.checkUserAuth,blogController.markFeatured);
router.route("/updateViewsCount/:alias").put(middleware.checkUserAuth,blogController.updateViewsCount);


//publication API
router.route("/addPublication").post(middleware.checkUserAuth,publicationController.addPublication);
router.route("/getAllPublication").post(middleware.checkUserAuth,publicationController.getAllPublication);
router.route("/updatePublication/:id").put(middleware.checkUserAuth,publicationController.updatePublication);
router.route("/getPublication/:alias").get(middleware.checkUserAuth,publicationController.getPublication);
router.route("/getUsersPublication/:userId").get(middleware.checkUserAuth,publicationController.getUsersPublication);
router.route("/removePublication/:userId/:publicationId").put(middleware.checkUserAuth,publicationController.removePublication);
router.route("/menuPublication/:publicationId").put(middleware.checkUserAuth,publicationController.menuPublication);

//user followed
router.route("/follow/blog/:id").post(middleware.checkUserAuth,followController.followBlog);
router.route("/follow/publication/:id").post(middleware.checkUserAuth,followController.followPublication);
router.route("/follow/author/:id").post(middleware.checkUserAuth,followController.followAuthor);
router.route("/follow/category/:id").post(middleware.checkUserAuth,followController.followCategory);
router.route("/follow/blog/:id").get(middleware.checkUserAuth,followController.getFollowedBlog);
router.route("/follow/publication/:id").get(middleware.checkUserAuth,followController.getFollowedPublication);
router.route("/follow/author/:id").get(middleware.checkUserAuth,followController.getFollowedAuthor);
router.route("/follow/category/:id").get(middleware.checkUserAuth,followController.getFollowedCategories);



export default router;
