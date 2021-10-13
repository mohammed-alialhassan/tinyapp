const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const creatingUser = function(email, hashedpassword, users) {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password: hashedpassword,
  };
  return userID;
};

const findUserByEmail = function(email, users) {
  for (let userKey in users) {
    const user = users[userKey];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

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

//Having idCheck only allows the specific user to edit/delete urls
const idCheck = function (shortURL, users, urlDatabase) {
  const ID = Object.keys(users);
  let matchedId = 0;
  for (const id of ID) {
    if (urlDatabase[shortURL].userID === id) {
      matchedId = 1;
    }
  }
  return matchedId;
}

module.exports = {
  generateRandomString,
  findUserByEmail,
  creatingUser,
  savedUrls,
  idCheck
}