function getViewer(user) {
  return {
    unique: user.unique,
    username: user.username,
  };
}

module.exports = getViewer;
