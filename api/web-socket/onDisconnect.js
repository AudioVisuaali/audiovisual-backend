const { createUserMessage, MESSAGE_USER_LEAVE } = require('../utils/message');
const { DISCONNECT, MESSAGE, USER_LEAVE } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

function onDisconnect(socket, data) {
  const { seek } = data;
  const { roomUnique } = socket.handshake.query;

  const user = users.getById(socket.id);
  const room = rooms.getById(roomUnique);

  if (!user) return;

  console.log(
    `[${roomUnique}] Requested ${DISCONNECT} [${socket.id}(${user.username})]`
  );

  const messageResponse = createUserMessage(seek, user, MESSAGE_USER_LEAVE);

  room.messages.push(messageResponse);
  rooms.update(roomUnique, room);

  rooms.update(roomUnique, room); // socket.updateVisualsRoom(roomUnique, room);
  rooms.deleteUser(user, roomUnique); // socket.disconnectUser(user, roomUnique);

  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, USER_LEAVE, user.unique);

  if (room.viewers.length) {
    return;
  }

  setTimeout(() => {
    const delMe = rooms.getById(roomUnique); // socket.getVisualsRoom(roomUnique);

    if (!delMe) {
      return;
    }

    if (!delMe.viewers.length) {
      console.log(`[${roomUnique}] Deleted for inactivity`);
      rooms.delete(delMe.unique); // socket.deleteVisualsRoom(delMe.unique);
    }
  }, process.env.ROOM_DELETE_TIMEOUT);
}

module.exports = onDisconnect;
