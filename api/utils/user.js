const uuidv4 = require('uuid/v4');

function createUser(id, username) {
  return {
    id,
    unique: uuidv4(),
    token: uuidv4(),
    username: username || `User-${uuidv4().substring(0, 4)}`,
  };
}

module.exports = createUser;
