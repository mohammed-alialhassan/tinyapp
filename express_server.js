const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { savedUrls, createUser, findUserByEmail, findUserByPassword } = require("./helperFunctions");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

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

const users = {
  "s4jf04": {
    id: "userRandomID",
    email: "thekid@struggling.com",
    password: "Raptors"
  }
};

/*
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); */

//Affixing cookie to user on multiple pages
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
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
  console.log(urlDatabase);
  let shortURL = Math.random().toString(36).substring(2,8);
  const userId = req.cookies["user_id"];
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect(`/urls/${shortURL}`);
});

//Creating a new url page (if not a user, directed back to login page)
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
  const signedUser = users[userId];

  if (!urlDatabase[req.params.shortURL]) {
    res.send("Id does not exist in user database!!");
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
  const shortURL = req.params.shortURL;
  const userId = req.cookies["user_id"];
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
  const ID = Object.keys(users);
  if (urlDatabase[shortURL].userID !== ID[0]) {
    res.send("Sorry, you dont have permission to delete other user's url");
    return;
  }
  
  delete urlDatabase[shortURL];
  res.redirect("/urls");
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
  const userFoundByEmail = findUserByEmail(email, users);
  const userFoundByPassword = findUserByPassword(password, users);

  if (!userFoundByEmail) {
    res.status(403).send("User cannot be found");
  } else if (userFoundByEmail && userFoundByPassword) {
    res.cookie('user_id', userFoundByPassword);
    res.redirect("/urls");
  } else {
    res.status(403).send("User's email is found but the password does not match");
  }
});
app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


//User Registration
app.get('/login', (req, res) => {
  const userId = req.cookies["user_id"];
  const signedUser = users[userId];
  const templateVars = {
    user: signedUser};
  res.render('login', templateVars);
});
app.get('/register',(req,res) => {
  const userId = req.cookies["user_id"];
  const signedUser = users[userId];
  const templateVars = {
    user: signedUser};
  res.render('register', templateVars);
});


//Authenticating registration (checking if user already exists in database)
app.post('/register',(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if ((email === "") || (password === "")) {
    res.status(400).send("Email or Password is not entered");
  }
  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(400).send("User already exists!");
  }
  const userID = createUser(email, password, users);
  res.cookie('user_id', userID);
  res.redirect("/urls");
});

//Port listening for clients
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});