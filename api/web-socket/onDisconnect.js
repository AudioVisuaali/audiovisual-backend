const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function onDisconnect(socket, seek) {
  const { roomUnique } = socket.handshake.query;

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  if (!user) return;

  console.log(
    `[${roomUnique}] Requested ${WS_TYPES.DISCONNECT} [${socket.id}(${user.username})]`
  );

  const messageResponse = messageUtil.createUserMessage(
    seek,
    user,
    messageUtil.MESSAGE_USER_LEAVE
  );

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.disconnectUser(user, roomUnique);

  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.USER_LEAVE, user.unique);
}

module.exports = onDisconnect;
