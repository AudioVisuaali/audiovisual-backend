const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

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

function onIsPlaying(socket, isPlaying) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.IS_PLAYING}`);

  if (typeof isPlaying !== 'boolean') {
    return;
  }

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  const messageResponse = messageUtil.createUserMessage(
    isPlaying,
    user,
    messageUtil.MESSAGE_VIDEO_IS_PLAYING
  );

  room.timelineAction.seeked = getSeek(room.timelineAction);
  room.timelineAction.updatedAt = new Date().getTime();
  room.timelineAction.playing = isPlaying;

  room.playing = isPlaying;
  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.IS_PLAYING, {
    isPlaying,
    timelineAction: room.timelineAction,
  });
}

module.exports = onIsPlaying;
