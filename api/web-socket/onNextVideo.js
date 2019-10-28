const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

function onNextVideo(socket, currentlyPlayingVideoUnique) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.NEXT_VIDEO}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  // Check for same current video
  const { playing, playlist } = room.videos;
  if (!playing || playing.unique !== currentlyPlayingVideoUnique) return;

  const messageResponse = messageUtil.createUserMessage(
    playing,
    user,
    messageUtil.MESSAGE_VIDEO_NEXT
  );

  // Add current video to history
  room.videos.history.push(playing);

  // Next video exists
  if (playlist.length) {
    room.videos.playing = room.videos.playlist[0];
    room.videos.playlist.splice(0, 1);
  } else {
    room.videos.playing = null;
  }

  room.timelineAction.updatedAt = new Date().toString();
  room.timelineAction.seeked = 0;
  room.timelineAction.action = room.playing ? 'play' : 'true';

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.NEXT_VIDEO, room.videos);
}

module.exports = onNextVideo;
