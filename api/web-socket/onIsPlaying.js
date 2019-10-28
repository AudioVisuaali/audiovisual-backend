const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function getTimelineNewSeeked(room) {
  switch (room.timelineAction.action) {
    case 'pause': {
      return room.timelineAction.seeked;
    }

    case 'play': {
      const date1 = new Date(room.timelineAction.updatedAt);
      const date2 = new Date();
      const diffTime = Math.abs(date2 - date1);
      const diffSeconds = Math.floor(diffTime / 1000);
      return room.timelineAction.seeked + diffSeconds;
    }

    default:
      return null;
  }
}

function onIsPlaying(socket, isPlaying) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.IS_PLAYING}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  const messageResponse = messageUtil.createUserMessage(
    isPlaying,
    user,
    messageUtil.MESSAGE_VIDEO_IS_PLAYING
  );

  const seeked = getTimelineNewSeeked(room);
  room.timelineAction.seeked = seeked;
  room.timelineAction.updatedAt = new Date().toString();
  room.timelineAction.action = isPlaying ? 'play' : 'pause';

  room.playing = isPlaying;
  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.IS_PLAYING, isPlaying);
}

module.exports = onIsPlaying;
