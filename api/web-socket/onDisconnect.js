const { createUserMessage, MESSAGE_USER_LEAVE } = require('../utils/message');
const { DISCONNECT, MESSAGE, USER_LEAVE } = require('./wsTypes');

function onDisconnect(socket, data) {
  const { seek } = data;
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

  if (room.viewers.length) {
    return;
  }

  setTimeout(() => {
    const delMe = socket.getVisualsRoom(roomUnique);

    if (!delMe) {
      return;
    }

    if (!delMe.viewers.length) {
      console.log(`[${roomUnique}] Deleted for inactivity`);
      socket.deleteVisualsRoom(delMe.unique);
    }
  }, process.env.ROOM_DELETE_TIMEOUT);
}

module.exports = onDisconnect;
