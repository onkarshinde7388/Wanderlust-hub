if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const listingRouters = require("./routes/listing.js")
const reviewRouters = require("./routes/review.js");
const { createSecretKey } = require("crypto");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouters = require("./routes/user.js");

// const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLAS_URL;

main().then(()=> {
    console.log("connected to DB");
}). catch((err) =>  {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
};

app.set("view engine" , "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended :  true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.listen(8080, () => {
   console.log("Server is listening to port 8080");
});

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret : process.env.SECRET ,
    },
    touchAfter: 24 * 3600,
});

store.on("error" , ()=>{
    console.log("Error in MONGO Session Store");
})

const sessionOptions  = {
    store,
    secret :  process.env.SECRET ,
    resave: false,
    saveUninitialized : true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 1000,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());         
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouters);
app.use("/listings/:id/reviews", reviewRouters);
app.use("/", userRouters);

app.all("*" , (req,res,next) =>{
    next(new ExpressError(404, "page not found!"));
})
    
app.use((err,req,res,next)=> {
   let{statusCode = 500, message = "Something went wrong"} = err;
   res.status(statusCode).render("error.ejs" ,{message})
});


