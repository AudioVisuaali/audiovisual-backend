const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function onSeek(socket, seek) {  
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.SEEK}`);

  if (seek === null) {
    return;
  }

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  const messageResponse = messageUtil.createUserMessage(
    seek,
    user,
    messageUtil.MESSAGE_VIDEO_SEEK
  );

  room.timelineAction.updatedAt = new Date().toString();
  room.timelineAction.seeked = parseFloat(seek);

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.SEEK, seek);
}

module.exports = onSeek;
