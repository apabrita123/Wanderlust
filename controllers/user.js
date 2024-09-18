const User = require("../models/user");

// get signup route callback
module.exports.renderSignupForm = (req, res) => {
  res.render("../views/users/signup.ejs");
};

// post signup route callback
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    // console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Registered Successfully");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

// get login route callback
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// post login route callback
module.exports.login = async (req, res) => {
  // let { username, password } = req.body;
  req.flash("success", "Logged in successfully!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// logout callback
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you're logged out!");
    res.redirect("/listings");
  });
};
