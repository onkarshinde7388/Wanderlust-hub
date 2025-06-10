const Listing = require("../models/listing.js");

module.exports.index = async ( req, res ) => {
const  allListings = await Listing.find({});
res.render("C:\\Users\\ONKAR\\OneDrive\\Wanderlust Hub Project\\views\\listings\\index.ejs", {allListings});
}

module.exports.renderNewForm = (req, res ) => {
  res.render("C:\\Users\\ONKAR\\OneDrive\\Wanderlust Hub Project\\views\\listings\\new.ejs");
};

module.exports.showForm = async ( req, res ) => { 
 let {id} = req.params;
 const listing = await Listing.findById(id).populate({path:"reviews", populate:{ path: "author"}}).populate("owner");
 if(!listing) {
    req.flash("error", "The listing you are trying to visit doesn't exist");
    res.redirect("/listings");
 }
res.render("C:\\Users\\ONKAR\\OneDrive\\Wanderlust Hub Project\\views\\listings\\show.ejs" ,{ listing } )
};

module.exports.createNewListing = async ( req, res) => {
let url = req.file.path;
let filename = req.file.filename;
const newListing = new Listing (req.body.listing);
newListing.owner = req.user._id;
newListing.image = {url, filename}
await newListing.save();
req.flash("success", " New listing created");
res.redirect("/listings"); 
};

module.exports.editListing = async ( req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
     if(!listing) {
    req.flash("error", "The listing you are trying to visit doesn't exist");
    res.redirect("/listings");
 }
   let originalImage = listing.image.url;
   originalImage = originalImage.replace("/upload", "/upload/h_250,w_250")
    res.render("C:\\Users\\ONKAR\\OneDrive\\Wanderlust Hub Project\\views\\listings\\edit.ejs" , { listing, originalImage });
};

module.exports.updateListing = async (req, res ) => {
   let {id} = req.params;
   let listing =  await Listing.findByIdAndUpdate(id, {...req.body.listing});
   if(typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url, filename};
      await listing.save();
   }
   req.flash("success", " Listing Updated!");
   res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
let { id } = req.params;
let deletedListing = await Listing.findByIdAndDelete(id);
console.log(deletedListing);
req.flash("success", " Listing Deleted!");
res.redirect("/listings");
};