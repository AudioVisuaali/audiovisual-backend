const createUser = require('../utils/user');
const createRoom = require('../utils/room');
const getViewer = require('../utils/viever');
const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

function authenticate(socket, next, ws) {
  const { token, username, roomUnique } = socket.handshake.query;

  const user = createUser(socket.id, username);
  if (token) {
    socket.handshake.token = user.token;
  }
  users.add(user);
  // ws.addVisualsUser(user);

  const messageResponse = messageUtil.createUserMessage(
    null,
    user,
    messageUtil.MESSAGE_USER_JOIN
  );

  let room;
  if (roomUnique) {
    const foundRoom = rooms.getById(roomUnique);
    // ws.getVisualsRoom(roomUnique);
    if (foundRoom) {
      foundRoom.viewers.push(getViewer(user));
      foundRoom.messages.push(messageResponse);
      foundRoom.videos.history = foundRoom.videos.history.slice(0, 50);
      foundRoom.messages = foundRoom.messages.slice(0, 100);
      room = foundRoom;
    }
  }

  if (!room) {
    room = createRoom(roomUnique, user);
    room.messages.push(messageResponse);
    rooms.add(room);
  }

  socket.join(roomUnique);
  ws.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  ws.sendToRoom(roomUnique, WS_TYPES.USER_JOIN, getViewer(user));
  socket.emit(WS_TYPES.USER, user);
  socket.emit(WS_TYPES.ROOM, room);

  console.log(`[${roomUnique}] (${user.username}) Joined Room`);

  return next();
}

module.exports = authenticate;
