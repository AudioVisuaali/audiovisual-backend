const messageUtil = require('../utils/message');
const createVideo = require('../utils/video');
const WS_TYPES = require('./wsTypes');

function onAddvideo(socket, videoInformation) {
  const { roomUnique } = socket.handshake.query;
  console.log(
    `[${roomUnique}] Requested ${WS_TYPES.ADD_VIDEO} ${videoInformation.url}`
  );

  const user = socket.getVisualsUser(socket.id);
  createVideo(videoInformation, user).then(video => {
    if (!video) return;

    let instantlyPlayingMessage;
    const room = socket.getVisualsRoom(roomUnique);

    if (room.videos.playing) {
      room.videos.playlist.push(video);
    } else {
      room.videos.playing = video;
      room.timelineAction.updatedAt = new Date().toString();
      room.timelineAction.seeked = 0;
      room.timelineAction.action = room.playing ? 'play' : 'true';
      instantlyPlayingMessage = messageUtil.createUserMessage(
        room.videos.playing,
        user,
        messageUtil.MESSAGE_VIDEO_NEXT
      );
    }

    const messageResponse = messageUtil.createUserMessage(
      video,
      user,
      messageUtil.MESSAGE_VIDEO_ADD
    );

    room.messages.push(messageResponse);
    if (instantlyPlayingMessage) {
      room.messages.push(instantlyPlayingMessage);
    }
    socket.updateVisualsRoom(roomUnique, room);

    socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
    if (instantlyPlayingMessage) {
      socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, instantlyPlayingMessage);
    }
    socket.sendToRoom(roomUnique, WS_TYPES.ADD_VIDEO, room.videos);
  });
}

module.exports = onAddvideo;
