const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { savedUrls, creatingUser, findUserByEmail, generateRandomString, idCheck } = require("./helperFunctions");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: ["Gotta protect these cookies!"]
}))

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "s4jf04"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "s4jf04"
  }
};

const password = "Raptors"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

const users = {
  "s4jf04": {
    id: "s4jf04",
    email: "thekid@struggling.com",
    password: hashedPassword
  }
};

app.get("/", (req, res) => {
  const userId = req.session.user_id;
  const signedUser = users[userId];
  if (signedUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Affixing cookie to user on multiple pages
app.get("/urls", (req, res) => {
  //formally req.cookies["user_id"];
  const userId = req.session.user_id;
  const signedUser = users[userId];
  const updatedShortUrl = savedUrls(userId, urlDatabase);
  const templateVars = {
    user: signedUser,
    updatedUrls: updatedShortUrl,
  };
  res.render("urls_index", templateVars);
});

//Url page for user, editing and delete buttons for urls on url page
app.post("/urls", (req, res) => {
  //formally used req.cookies["user_id"];
  console.log(urlDatabase);
  //Making use of the generateRandomString function
  let shortURL = generateRandomString();
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect(`/urls/${shortURL}`);
});

//Creating a new url page (if not a user, directed back to login page)
app.get("/urls/new", (req, res) => {
  //formally used req.cookies["user_id"]
  const userId = req.session.user_id;
  const signedUser = users[userId];
  const templateVars = {
    user: signedUser,};
  if (signedUser) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//ShortURL and LongURL, different Id for each url in database
app.get("/urls/:shortURL", (req, res) => {
  //formally used before req.cookies["user_id"]
  const userId = req.session.user_id;
  const signedUser = users[userId];

  if (!urlDatabase[req.params.shortURL]) {
    res.send("ID not found, Please try again");
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = {
    user: signedUser,
    shortURL: req.params.shortURL, longURL: longURL };
  if (urlDatabase[req.params.shortURL].userID !== users[userId].id) {
    res.send("Sorry, you dont have permission to edit other user's url");
    return;
  }
  
  res.render("urls_show", templateVars);
});

//Redirects user to extended longUrl page
app.get("/u/:shortURL", (req, res) => {
  //formally was req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const signedUser = users[userId];
  const templateVars = {
    user: signedUser,
  };
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.render('error.ejs', templateVars);
  }
});

//deleting a url from logged in user's database
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  let matchedId = 0;
  matchedId = idCheck(shortURL, users, urlDatabase);
  if (!matchedId) {
    res.send("Permission denied! Deleting this URL ");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  let matchedId = 0;
      matchedId = idCheck(shortURL, users, urlDatabase);
  if (!matchedId) {
    res.send("Permission denied! Deleting this URL ");
    return;
  }
});

//Updating The Long URL
app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.quoteContent;
  res.redirect("/urls");
});

//Cookies For Login
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundByEmail = findUserByEmail(email, users);

  if (!foundByEmail) {
    res.status(403).send("User cannot be found");
  } else {
    if (bcrypt.compareSync(password, foundByEmail.password)) {
      //res.cookie('user_id', foundByPassword);
    req.session.user_id = foundByEmail.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Please try another password");
  }
 }
});

app.post("/logout", (req,res) => {
  //res.clearCookie('user_id');
  req.session = null;
  res.redirect("/urls");
});

//User Registration
app.get('/login', (req, res) => {
  //formally was req.cookies["user_id"]
  const userId = req.session.user_id;
  const signedUser = users[userId];
  const templateVars = {
    user: signedUser};
    if (signedUser) {
      res.redirect("/urls");
    } else {
      res.render('login', templateVars);
    }
});

app.get('/register',(req,res) => {
  //formally was req.cookies["user_id"]
  const userId = req.session.user_id;
  const signedUser = users[userId];
  const templateVars = {
    user: signedUser};
    if (signedUser) {
      res.redirect("/urls");
    } else {
      res.render('register', templateVars);
    }
});

//Authenticating registration (checking if user already exists in database)
app.post('/register',(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if ((email === "") || (password === "")) {
    res.status(400).send("No email or password entered!");
  }
  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(400).send("User already exists!");
  }
  const userID = creatingUser(email, hashedPassword, users);
  //formally was res.cookie('user_id', userID);
  req.session.user_id = userID;
  res.redirect("/urls");
});

//Port listening for clients
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});