const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');
const getViewer = require('../utils/viever');

function onUserUsernameChange(socket, newName) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.USER_USERNAME_CHANGE}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  const oldUser = getViewer(Object.assign({}, user));
  user.username = newName;
  const safeUser = getViewer(user);

  const messageResponse = messageUtil.createUserMessage(
    oldUser,
    user,
    messageUtil.MESSAGE_USER_USERNAME_CHANGE
  );

  room.viewers = room.viewers.map(v =>
    v.unique === user.unique ? { ...v, username: newName } : v
  );

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.USER_USERNAME_CHANGE, safeUser);
}

module.exports = onUserUsernameChange;
