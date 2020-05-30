const {
  createUserMessage,
  MESSAGE_USER_USERNAME_CHANGE,
} = require('../utils/message');
const { MESSAGE, USER_USERNAME_CHANGE } = require('./wsTypes');
const getViewer = require('../utils/viever');
const users = require('../store/users');
const rooms = require('../store/rooms');

function onUserUsernameChange(socket, data) {
  const { newName } = data;
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${USER_USERNAME_CHANGE}`);

  const user = users.getById(socket.id); // const user = socket.getVisualsUser(socket.id);
  const room = rooms.getById(roomUnique); // const room = socket.getVisualsRoom(roomUnique);

  const oldUser = getViewer({ ...user });
  user.username = newName;
  const safeUser = getViewer(user);

  const messageResponse = createUserMessage(
    oldUser,
    user,
    MESSAGE_USER_USERNAME_CHANGE
  );

  room.viewers = room.viewers.map(v =>
    v.unique === user.unique ? { ...v, username: newName } : v
  );

  room.messages.push(messageResponse);
  rooms.update(roomUnique, room); // socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, USER_USERNAME_CHANGE, safeUser);
}

module.exports = onUserUsernameChange;
