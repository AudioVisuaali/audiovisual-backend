const { createUserMessage, MESSAGE_VIDEO_SKIP } = require('../utils/message');
const { MESSAGE, SKIP } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

const randomIndexFromPlaylist = room =>
  Math.floor(Math.random() * room.videos.playlist.length);

function createTimeline(timelineAction) {
  return {
    ...timelineAction,
    updatedAt: new Date().getTime(),
    seeked: 0,
  };
}

function onSkip(socket, data) {
  const { currentlyPlayingVideoUnique } = data;
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${SKIP}`);

  const user = users.getById(socket.id); // const user = socket.getVisualsUser(socket.id);
  const room = rooms.getById(roomUnique); // const room = socket.getVisualsRoom(roomUnique);

  // Check for same current video
  const { playing, playlist } = room.videos;
  if (playing && playing.unique !== currentlyPlayingVideoUnique) return;

  // Add current video to history
  room.videos.history.push(playing);

  // Next video exists
  if (playlist.length) {
    const isLinear = room.videos.playOrder === 'linear';
    const nextItemPosition = isLinear ? 0 : randomIndexFromPlaylist(room);
    room.videos.playing = room.videos.playlist[nextItemPosition];
    room.videos.playlist.splice(nextItemPosition, 1);
  } else {
    room.videos.playing = null;
  }

  const messageResponse = createUserMessage(
    room.videos.playing,
    user,
    MESSAGE_VIDEO_SKIP
  );

  room.timelineAction = createTimeline(room.timelineAction);

  room.messages.push(messageResponse);
  rooms.update(roomUnique, room); // socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, SKIP, {
    playing: room.videos.playing,
    timelineAction: room.timelineAction,
  });
}

module.exports = onSkip;
