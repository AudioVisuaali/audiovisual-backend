const { createUserMessage, MESSAGE_VIDEO_SEEK } = require('../utils/message');
const { MESSAGE, SEEK } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

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

  const user = users.getById(socket.id); // const user = socket.getVisualsUser(socket.id);
  const room = rooms.getById(roomUnique); // const room = socket.getVisualsRoom(roomUnique);

  const messageResponse = createUserMessage(newSeek, user, MESSAGE_VIDEO_SEEK);

  room.timelineAction = createTimeline(room.timelineAction, newSeek);

  room.messages.push(messageResponse);
  rooms.update(roomUnique, room); // socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, SEEK, {
    seek: newSeek,
    timelineAction: room.timelineAction,
  });
}

module.exports = onSeek;
