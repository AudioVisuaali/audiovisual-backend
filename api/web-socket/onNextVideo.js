const messageUtil = require('../utils/message');
const WS_TYPES = require('./wsTypes');

const randomIndexFromPlaylist = room =>
  Math.floor(Math.random() * room.videos.playlist.length);

function onNextVideo(socket, currentlyPlayingVideoUnique) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${WS_TYPES.NEXT_VIDEO}`);

  const user = socket.getVisualsUser(socket.id);
  const room = socket.getVisualsRoom(roomUnique);

  // Check for same current video
  const { playing, playlist } = room.videos;
  if (!playing || playing.unique !== currentlyPlayingVideoUnique) return;

  // Add current video to history
  room.videos.history.push(playing);
  let messageResponse;

  // Next video exists
  if (playlist.length) {
    const isLinear = room.videos.playOrder === 'linear';
    const nextItemPosition = isLinear ? 0 : randomIndexFromPlaylist(room);
    room.videos.playing = room.videos.playlist[nextItemPosition];
    room.videos.playlist.splice(nextItemPosition, 1);
  } else {
    room.videos.playing = null;
  }

  room.timelineAction.updatedAt = new Date().toString();
  room.timelineAction.seeked = 0;
  room.timelineAction.action = room.playing ? 'play' : 'true';

  if (room.videos.playing) {
    messageResponse = messageUtil.createUserMessage(
      room.videos.playing,
      user,
      messageUtil.MESSAGE_VIDEO_NEXT
    );
    room.messages.push(messageResponse);
  }
  socket.updateVisualsRoom(roomUnique, room);

  if (room.videos.playing) {
    socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
  }
  socket.sendToRoom(roomUnique, WS_TYPES.NEXT_VIDEO, room.videos);
}

module.exports = onNextVideo;
