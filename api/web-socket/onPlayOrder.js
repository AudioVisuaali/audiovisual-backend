const {
  createUserMessage,
  MESSAGE_VIDEO_PALAY_ORDER,
} = require('../utils/message');
const { MESSAGE, PLAY_ORDER } = require('./wsTypes');

function onPlayOrder(socket, order) {
  if (!['linear', 'random'].includes(order)) return;

  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${PLAY_ORDER}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  room.videos.playOrder = order;

  const messageResponse = createUserMessage(
    order,
    user,
    MESSAGE_VIDEO_PALAY_ORDER
  );

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, PLAY_ORDER, order);
}

module.exports = onPlayOrder;
