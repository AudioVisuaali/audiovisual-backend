const uuidv4 = require('uuid/v4');
const getViewer = require('./viever');

function createRoom(unique, user) {
  return {
    owner: user.unique,
    unique: unique || uuidv4().substring(0, 8),
    seek: {
      updatedAt: 0,
      seekTo: 0,
    },
    playing: true,
    videos: {
      playOrder: 'linear', // random
      playing: null,
      playlist: [],
      history: [],
    },
    messages: [],
    viewers: [getViewer(user)],
  };
}

module.exports = createRoom;
