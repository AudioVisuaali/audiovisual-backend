const {
  createUserMessage,
  MESSAGE_VIDEO_IS_PLAYING,
} = require('../utils/message');

const { MESSAGE, IS_PLAYING } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

function createTimeline(timelineAction, playing, seeked) {
  return {
    ...timelineAction,
    updatedAt: new Date().getTime(),
    seeked: seeked, // getSeek(timelineAction),
    playing,
  };
}

function onIsPlaying(socket, data) {
  const { isPlaying, played } = data;
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${IS_PLAYING}`);

  if (typeof isPlaying !== 'boolean') {
    return;
  }

  const user = users.getById(socket.id); // const user = socket.getVisualsUser(socket.id);
  const room = rooms.getById(roomUnique); // const room = socket.getVisualsRoom(roomUnique);

  const messageResponse = createUserMessage(
    isPlaying,
    user,
    MESSAGE_VIDEO_IS_PLAYING
  );

  room.timelineAction = createTimeline(room.timelineAction, isPlaying, played);

  room.playing = isPlaying;
  room.messages.push(messageResponse);
  rooms.update(roomUnique, room); // socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, IS_PLAYING, {
    isPlaying,
    timelineAction: room.timelineAction,
  });
}

module.exports = onIsPlaying;
