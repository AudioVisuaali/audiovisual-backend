const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

const randomIndexFromPlaylist = room =>
  Math.floor(Math.random() * room.videos.playlist.length);

function onSkip(socket, currentlyPlayingVideoUnique) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.SKIP}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  // Check for same current video
  const { playing, playlist } = room.videos;
  if (playing && playing.unique !== currentlyPlayingVideoUnique) return;

  // Add current video to history
  room.videos.history.push(playing);

  // Next video exists
  if (playlist.length) {
    const isLinear = room.videos.playOrder === 'linear';
    const nextItemPosition = isLinear ? 0 : randomIndexFromPlaylist(room);
    room.videos.playing = room.videos.playlist[nextItemPosition];
    room.videos.playlist.splice(nextItemPosition, 1);
  } else {
    room.videos.playing = null;
  }

  const messageResponse = messageUtil.createUserMessage(
    room.videos.playing,
    user,
    messageUtil.MESSAGE_VIDEO_SKIP
  );

  room.timelineAction.updatedAt = new Date().getTime();
  room.timelineAction.seeked = 0;

  room.messages.push(messageResponse);
  socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, WS_TYPES.SKIP, {
    playing: room.videos.playing,
    timelineAction: room.timelineAction,
  });
}

module.exports = onSkip;
