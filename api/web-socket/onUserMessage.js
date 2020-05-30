const { createUserMessage, MESSAGE_USER } = require('../utils/message');
const { USER_MESSAGE, MESSAGE } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

function onUserMessage(socket, data) {
  const { message } = data;
  const { roomUnique } = socket.handshake.query;

  const user = users.getById(socket.id); // const user = socket.getVisualsUser(socket.id);
  const room = rooms.getById(roomUnique); // const room = socket.getVisualsRoom(roomUnique);

  console.log(
    `[${roomUnique}] Requested ${USER_MESSAGE} [${user.unique}(${
      user.username
    })]:${message}`
  );

  const messageResponse = createUserMessage(message, user, MESSAGE_USER);

  room.messages.push(messageResponse);
  rooms.update(roomUnique, room);
  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
}

module.exports = onUserMessage;
