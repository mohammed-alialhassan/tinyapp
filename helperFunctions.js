const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const createUser = function(email, password, users) {
  const userID = Math.random().toString(36).substring(2,8);
  
  users[userID] = {
    id: userID,
    email,
    password,
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
  return false;
};

const findUserByPassword = function(password, users) {
  for (let userKey in users) {
    const user = users[userKey];
    if (user.password === password) {
      return user.id;
    }
  }
  return false;
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

module.exports = {
  generateRandomString,
  findUserByEmail,
  findUserByPassword,
  createUser,
  savedUrls
}