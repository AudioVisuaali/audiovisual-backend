const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function onRemoveVideo(socket, videoUnique) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.REMOVE_VIDEO}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  let newPlaylist = [];
  let toHistory = null;
  for (let j = 0; j < room.videos.playlist.length; j++) {
    const video = room.videos.playlist[j];
    // match room
    if (video.unique === videoUnique) {
      toHistory = video;
    } else {
      newPlaylist.push(video);
    }
  }

  if (!toHistory) return;

  room.videos.playlist = newPlaylist;
  room.videos.history.push(toHistory);

  const messageResponse = messageUtil.createUserMessage(
    toHistory,
    user,
    messageUtil.MESSAGE_VIDEO_DELETE
  );

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.REMOVE_VIDEO, {
    toHistory,
    removeFromQue: videoUnique,
    requestedBy: user,
  });
}

module.exports = onRemoveVideo;
