const {
  createUserMessage,
  MESSAGE_VIDEO_IS_PLAYING,
} = require('../utils/message');

const { MESSAGE, IS_PLAYING } = require('./wsTypes');

function getSeek(timelineAction) {
  const { seeked, updatedAt, playing } = timelineAction;

  if (playing) {
    const date1 = new Date(updatedAt);
    const date2 = new Date();
    const diffTime = Math.abs(date2 - date1);
    const diffSeconds = Math.floor(diffTime / 1000);
    return seeked + diffSeconds;
  }

  return seeked;
}

function createTimeline(timelineAction, playing) {
  return {
    ...timelineAction,
    updatedAt: new Date().getTime(),
    seeked: getSeek(timelineAction),
    playing,
  };
}

function onIsPlaying(socket, isPlaying) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${IS_PLAYING}`);

  if (typeof isPlaying !== 'boolean') {
    return;
  }

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  const messageResponse = createUserMessage(
    isPlaying,
    user,
    MESSAGE_VIDEO_IS_PLAYING
  );

  room.timelineAction = createTimeline(room.timelineAction);

  room.playing = isPlaying;
  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, IS_PLAYING, {
    isPlaying,
    timelineAction: room.timelineAction,
  });
}

module.exports = onIsPlaying;
