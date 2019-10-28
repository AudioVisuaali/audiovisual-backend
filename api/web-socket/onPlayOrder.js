const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function onPlayOrder(socket, order) {
  if (!['linear', 'random'].includes(order)) return;

  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.PLAY_ORDER}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  room.videos.playOrder = order;

  const messageResponse = messageUtil.createUserMessage(
    order,
    user,
    messageUtil.MESSAGE_VIDEO_PALAY_ORDER
  );

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.PLAY_ORDER, order);
}

module.exports = onPlayOrder;
