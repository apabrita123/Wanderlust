if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");
const multer = require("multer");
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in MONGO SESSION STORE", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
}

app.get(
  "/search",
  wrapAsync(async (req, res, next) => {
    let listings = await Listing.find(req.query);
    // console.log(listings.length);
    if (!listings.length) {
      req.flash("error", "Sorry! Not available.");
      return res.redirect("/listings");
    }
    res.render("listings/search.ejs", { listings });
  })
);

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gamil.com",
    username: "delta-student",
  });

  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// error-handling middleWare
app.use((err, req, res, next) => {
  let { status = 500, message = "something went wrong" } = err;
  res.render("error.ejs", { err });
});

const port = process.env.PORT || 8080; // fallback to 8080 for local development
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
