const { createUserMessage, MESSAGE_VIDEO_NEXT } = require('../utils/message');
const { MESSAGE, NEXT_VIDEO } = require('./wsTypes');

const randomIndexFromPlaylist = room =>
  Math.floor(Math.random() * room.videos.playlist.length);

function createTimeline(timelineAction) {
  return {
    ...timelineAction,
    updatedAt: new Date().getTime(),
    seeked: 0,
  };
}

function onNextVideo(socket, currentlyPlayingVideoUnique) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${NEXT_VIDEO}`);

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

  room.timelineAction = createTimeline(room.timelineAction);

  if (room.videos.playing) {
    messageResponse = createUserMessage(
      room.videos.playing,
      user,
      MESSAGE_VIDEO_NEXT
    );
    room.messages.push(messageResponse);
  }
  socket.updateVisualsRoom(roomUnique, room);

  if (room.videos.playing) {
    socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  }
  socket.sendToRoom(roomUnique, NEXT_VIDEO, {
    playing: room.videos.playing,
    timelineAction: room.timelineAction,
  });
}

module.exports = onNextVideo;
