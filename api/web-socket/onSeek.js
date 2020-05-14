const { createUserMessage, MESSAGE_VIDEO_SEEK } = require('../utils/message');
const { MESSAGE, SEEK } = require('./wsTypes');

function createTimeline(timelineAction, seeked) {
  return {
    ...timelineAction,
    updatedAt: new Date().getTime(),
    seeked,
  };
}

function onSeek(socket, data) {
  const { seekToSeconds } = data;
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${SEEK}`);

  const newSeek = parseFloat(seekToSeconds, 10);
  if (Number.isNaN(newSeek)) {
    return;
  }

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  const messageResponse = createUserMessage(newSeek, user, MESSAGE_VIDEO_SEEK);

  room.timelineAction = createTimeline(room.timelineAction, seekToSeconds);
  console.log(room.timelineAction);
  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, SEEK, {
    seek: newSeek,
    timelineAction: room.timelineAction,
  });
}

module.exports = onSeek;
