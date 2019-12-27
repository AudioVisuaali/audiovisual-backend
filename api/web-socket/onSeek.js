const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function onSeek(socket, seek) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.SEEK}`);

  const newSeek = parseFloat(seek, 10);
  if (Number.isNaN(newSeek)) {
    return;
  }

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  const messageResponse = messageUtil.createUserMessage(
    newSeek,
    user,
    messageUtil.MESSAGE_VIDEO_SEEK
  );

  room.timelineAction.updatedAt = new Date().getTime();
  room.timelineAction.seeked = newSeek;

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.SEEK, {
    seek: newSeek,
    timelineAction: room.timelineAction,
  });
}

module.exports = onSeek;
