const Listing = require("../models/listing");

const opencage = require('opencage-api-client');


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "listing you requested for doesnot exist");
        res.redirect("/listings");
    }


    // let latit = 79.0849;
    // let longi= 21.1463;
    // note that the library takes care of URI encoding
opencage
.geocode({ q: listing.location })
.then((data) => {
  // console.log(JSON.stringify(data));
  if (data.status.code === 200 && data.results.length > 0) {
    const place = data.results[0];
    // console.log(place.formatted);
    //   console.log(place.geometry);
    //   latit = place.geometry.lat;
    //   longi = place.geometry.lng;
      res.render("listings/show.ejs", { listing, place });
    // console.log(place.annotations.timezone.name);
  } else {
    console.log('Status', data.status.message);
    console.log('total_results', data.total_results);
  }
})
.catch((error) => {
  // console.log(JSON.stringify(error));
  console.log('Error', error.message);
  // other possible response codes:
  // https://opencagedata.com/api#codes
  if (error.status.code === 402) {
    console.log('hit free trial daily limit');
    console.log('become a customer: https://opencagedata.com/pricing');
  }
});

// ... prints
// Theresienhöhe 11, 80339 Munich, Germany
// { lat: 48.1341651, lng: 11.5464794 }
    // Europe/Berlin
    // console.log(latit);
    // console.log(longi);

    // res.render("listings/show.ejs", { listing });
};



module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");

};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing you requested for doesnot exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload", "/upload/h_300,w_300");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
   
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file!=="undefined") {
        let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }
    
    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
};