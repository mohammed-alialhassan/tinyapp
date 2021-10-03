const { assert } = require('chai');

const { findUserByEmail } = require('../helperFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });

  it('should return undefined with non-existent email', function() {
    const user = findUserByEmail("user3@example.com", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined with empty string email', function() {
    const user = findUserByEmail("", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined if null is passed to email', function() {
    const user = findUserByEmail(null, testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined if " " is passed to email', function() {
    const user = findUserByEmail(" ", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);

  });

});