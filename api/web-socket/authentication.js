const createUser = require('../utils/user');
const createRoom = require('../utils/room');
const getViewer = require('../utils/viever');
const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function authenticate(socket, next, ws) {
  const { token, username, roomUnique } = socket.handshake.query;

  let user;

  if (token) {
    const foundUser = ws.getVisualsUser(token, true);
    if (foundUser) {
      foundUser.username = username;
      foundUser.id = socket.id;
      ws.updateVisualsUser(foundUser.unique, foundUser);
      user = foundUser;
    }
  }

  if (!user) {
    user = createUser(socket.id, username);
    socket.handshake.token = user.token;
    ws.addVisualsUser(user);
  }
  const messageResponse = messageUtil.createUserMessage(
    null,
    user,
    messageUtil.MESSAGE_USER_JOIN
  );

  let room;
  if (roomUnique) {
    const foundRoom = ws.getVisualsRoom(roomUnique);
    if (foundRoom) {
      foundRoom.viewers.push(getViewer(user));
      foundRoom.messages.push(messageResponse);
      room = foundRoom;
    }
  }

  if (!room) {
    room = createRoom(roomUnique, user);
    room.messages.push(messageResponse);
    ws.addVisualsRoom(room);
  }

  socket.join(roomUnique);
  ws.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  ws.sendToRoom(roomUnique, WS_TYPES.USER_JOIN, getViewer(user));
  socket.emit(WS_TYPES.USER, user);
  socket.emit(WS_TYPES.ROOM, room);

  return next();
}

module.exports = authenticate;
