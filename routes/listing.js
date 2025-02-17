const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


//add validateListing in post after upload..
router.route("/")
    .get( wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing));

//add new listing
router.get("/new",isLoggedIn,listingController.renderNewForm );


router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync( listingController.destroyListing));

//show all listing //index


//show route

//create route

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync( listingController.renderEditForm));

//update route

//delete route

module.exports = router;