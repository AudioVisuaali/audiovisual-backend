const { createUserMessage, MESSAGE_REORDER } = require('../utils/message');
const { MESSAGE, REORDER } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

function onReorder(socket, data) {
  const { reorder } = data;
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${REORDER}`);

  const user = users.getById(socket.id); // const user = socket.getVisualsUser(socket.id);
  const room = rooms.getById(roomUnique); // const room = socket.getVisualsRoom(roomUnique);

  let video;
  for (let i = 0; i < room.videos.playlist.length; i++) {
    if (room.videos.playlist[i].unique !== reorder.unique) continue;

    video = room.videos.playlist.splice(i, 1);
    break;
  }

  if (!video) return;

  room.videos.playlist.splice(reorder.newIndex, 0, video[0]);

  const reorderMessage = Object.assign({}, reorder);
  reorderMessage.video = video[0];
  const messageResponse = createUserMessage(
    reorderMessage,
    user,
    MESSAGE_REORDER
  );

  room.messages.push(messageResponse);
  rooms.update(roomUnique, room); // socket.updateVisualsRoom(roomUnique, room);

  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, REORDER, reorder);
}

module.exports = onReorder;
