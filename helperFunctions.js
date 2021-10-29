const bcrypt = require('bcryptjs');

//helps generate a random id for creatingUser function below
const generateRandomString = () => Math.random().toString(36).substr(2, 6);

//used in registration for creating a new user
const creatingUser = function(email, password, users) {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password,
  };
  return userID;
};

//helper function for authenticatingUser and also check input email vs an email in the database to look for a match
const findUserByEmail = function(email, users) {
  for (let userKey in users) {
    const user = users[userKey];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

//used in login/registration, for checking if user exists in database already
const authenticateUser = (email, password, users) => {
  const user = findUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  console.log("Password is incorrect");
  return null;
};

//used to link urls to specific user
const savedUrls = function(id, urlData) {
  const updatedUrls = {};
  const keys  = Object.keys(urlData);
  for (const key of keys) {
    if (urlData[key]['userID'] === id) {
      updatedUrls[key] = urlData[key];
    }
  }
  return updatedUrls;
};

module.exports = {
  generateRandomString,
  authenticateUser,
  creatingUser,
  savedUrls,
  findUserByEmail
}