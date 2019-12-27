const {
  createUserMessage,
  MESSAGE_USER_USERNAME_CHANGE,
} = require('../utils/message');
const { MESSAGE, USER_USERNAME_CHANGE } = require('./wsTypes');
const getViewer = require('../utils/viever');

function onUserUsernameChange(socket, newName) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${USER_USERNAME_CHANGE}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

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
  socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, USER_USERNAME_CHANGE, safeUser);
}

module.exports = onUserUsernameChange;
