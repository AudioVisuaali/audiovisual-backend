const {
  createUserMessage,
  MESSAGE_VIDEO_PALAY_ORDER,
} = require('../utils/message');
const { MESSAGE, PLAY_ORDER } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

function onPlayOrder(socket, data) {
  const { order } = data;
  if (!['linear', 'random'].includes(order)) return;

  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${PLAY_ORDER}`);

  const user = users.getById(socket.id); // const user = socket.getVisualsUser(socket.id);
  const room = rooms.getById(roomUnique); // const room = socket.getVisualsRoom(roomUnique);

  room.videos.playOrder = order;

  const messageResponse = createUserMessage(
    order,
    user,
    MESSAGE_VIDEO_PALAY_ORDER
  );

  room.messages.push(messageResponse);
  rooms.update(roomUnique, room); // socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, PLAY_ORDER, order);
}

module.exports = onPlayOrder;
