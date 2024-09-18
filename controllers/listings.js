const { response } = require("express");
const Listing = require("../models/listing");
const apiKey = "IVIeAkxE40fwKtCy78mQ";

// index route callback
module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

// new route callback
module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

// show route callback
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let demoListing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!demoListing) {
    req.flash("error", "Listing you requested for, doesn't exist!");
    res.redirect("/listings");
  }
  // console.log(demoListing);
  res.render("./listings/show.ejs", { demoListing });
};

// create route callback
module.exports.createListing = async (req, res, next) => {
  let address = req.body.listing.location;
  let response = await fetch(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(
      address
    )}.json?key=${apiKey}`
  ).then((data) => data.json());
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.features[0].geometry;

  let savedListing = await newListing.save();
  req.flash("success", "New Listing Added!");
  res.redirect("/listings");
};

// edit route callback
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  Listing.findById;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for, doesn't exist!");
    res.redirect("/listings");
  }
  let imgUrl = listing.image.url;
  imgUrl = imgUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, imgUrl });
};

// update listing route
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// delete listing route
module.exports.deletelisting = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
