const { createUserMessage, MESSAGE_USER_LEAVE } = require('../utils/message');
const { DISCONNECT, MESSAGE, USER_LEAVE } = require('./wsTypes');

function onDisconnect(socket, seek) {
  const { roomUnique } = socket.handshake.query;

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  if (!user) return;

  console.log(
    `[${roomUnique}] Requested ${DISCONNECT} [${socket.id}(${user.username})]`
  );

  const messageResponse = createUserMessage(seek, user, MESSAGE_USER_LEAVE);

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.disconnectUser(user, roomUnique);

  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, USER_LEAVE, user.unique);
}

module.exports = onDisconnect;
