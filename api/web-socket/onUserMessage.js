const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function onUserMessage(socket, message) {
  const { roomUnique } = socket.handshake.query;
  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  console.log(
    `[${roomUnique}] Requested ${WS_TYPES.USER_MESSAGE} [${user.unique}(${user.username})]:${message}`
  );

  const messageResponse = messageUtil.createUserMessage(
    message,
    user,
    messageUtil.MESSAGE_USER
  );

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
}

module.exports = onUserMessage;
