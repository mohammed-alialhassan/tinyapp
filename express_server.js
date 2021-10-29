const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { savedUrls, creatingUser, authenticateUser, generateRandomString, findUserByEmail} = require("./helperFunctions");
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

const password = "raptors"; // found in the req.params object
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
  if (!signedUser) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

//Affixing cookie to user on multiple pages
app.get("/urls", (req, res) => {
  //formally req.cookies["user_id"];
  const userId = req.session.user_id;
  const signedUser = users[userId];
  if (!signedUser) {
    res.status(401).send("You have to be a logged in user in order to access this function");
  }
  const updatedShortUrl = savedUrls(userId, urlDatabase);
  const templateVars = {
    user: signedUser,
    updatedShortUrl,
  };
  res.render("urls_index", templateVars);
});

//Url page for user, editing and delete buttons for urls on url page
app.post("/urls", (req, res) => {
  //formally used req.cookies["user_id"];
  //Making use of the generateRandomString function
  let shortURL = generateRandomString();
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(403).redirect("/login");
  } else {
    urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect(`/urls/${shortURL}`);
  }
});

//Creating a new url page (if not a user, directed back to login page)
app.get("/urls/new", (req, res) => {
  //formally used req.cookies["user_id"]
  const userId = req.session.user_id;
  const signedUser = users[userId];
  const updatedShortUrl = savedUrls(userId, urlDatabase);

  if (!signedUser) {
     res.redirect('/login');
  } 
    const templateVars = {
    user: signedUser,
    urls: updatedShortUrl
  };
  res.render("urls_new", templateVars);
  });

//ShortURL and LongURL, different Id for each url in database
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  // adding readability to limit redundancy*
  const urlObject = urlDatabase[shortURL];
  const urlExists = !!urlObject;

  // saves updatedShortUrls within the savedUrls function to our database
  const updatedShortUrl = savedUrls(userId, urlDatabase);
  
  // if URL exists security bug, double !! turns it into a boolean
  if (!urlExists) {
    return res.status(400).send("The URL you requested does not exist.");
  };

  const templateVars = {
    user: users[userId],
    urls: updatedShortUrl,
    shortURL: shortURL,
    longURL: urlObject.longURL
  };

  // fixed security hole that allowed non-users to access urls
  if (!userId) {
    res.status(401).send("You have to be a logged in user in order to access this function");
  };
  
  // security with touching urls that do not belong to the user
  if (userId !== urlObject.userID) {
    return res.status(403).send("You did not create this URL, hence you do not have access to this URL.");
  };
  res.render("urls_show", templateVars);
});

//Redirects user to extended longUrl page
app.get("/u/:shortURL", (req, res) => {
    const userId = req.session.user_id;
    const shortURL = req.params.shortURL;
  
    if (!urlDatabase[shortURL]) {
      return res.status(200).send("URL does not exist :(");
    };
  
    const longURL = urlDatabase[shortURL].longURL;
  
    if (!(longURL)) {
      return res.status(200).send("URL does not exist :(");
    };
  
    req.session.user_id = userId;
    res.redirect(longURL);
});

//deleting a url from logged in user's database
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  
  if (urlDatabase[shortURL].userID !== userId) {
    return res.send("Sorry, you dont have permission to delete another user's url! That's rude!");
  };

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  
  if (userId && userId === urlDatabase[shortURL].userId) {
    res.send("Permission denied! Deleting this URL ");
    return;
  }
});

//Updating The Long URL 
app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.quoteContent;
  const userId = req.session.user_id;
  const signedUser = users[userId];
  if (!signedUser) {
  res.status(401).send("You have to be a logged in user in order to access this function");
  } else {
    res.redirect("/urls");
  }
});


//Cookies For Login
app.post("/login", (req,res) => {
  const { email, password } = req.body;
  const authenticatedUser = authenticateUser(email, password, users);
 
  if (authenticatedUser && bcrypt.compareSync(password, authenticatedUser.password)) {
    req.session.user_id = authenticatedUser.id;
    return res.redirect("/urls");
  }

  return res.status(403).send("Email or password is incorrect!");
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
  if (signedUser) {
      res.redirect("/urls");
      return;
    } else {
      const templateVars = {
      user: signedUser
    };
      res.render('login', templateVars);
    }
});

app.get('/register',(req,res) => {
  //formally was req.cookies["user_id"]
  const userId = req.session.user_id;
  const signedUser = users[userId];
  if (signedUser) {
      res.redirect("/urls");
      return;
    } else {
      const templateVars = {
      user: null
    };
      res.render('register', templateVars);
    }
});

//Authenticating registration (checking if user already exists in database)
app.post('/register',(req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (email === ""|| password === "") {
    return res.status(400).send("Error: You need to provide both an email and password to register!");
  };
  const userExist = findUserByEmail(email, users);
  
  if (userExist) {
    res.status(400).send('Sorry, that user already exists!');
    return;
  };
  const userId = creatingUser(email, hashedPassword, users);
  req.session.user_id = userId;
  res.redirect("/urls");
});

//Port listening for clients
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});