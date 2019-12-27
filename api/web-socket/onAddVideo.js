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

    let messageResponse;
    const room = socket.getVisualsRoom(roomUnique);

    if (room.videos.playing) {
      room.videos.playlist.push(video);

      messageResponse = messageUtil.createUserMessage(
        video,
        user,
        messageUtil.MESSAGE_VIDEO_ADD
      );
    } else {
      room.videos.playing = video;
      room.timelineAction.updatedAt = new Date().getTime();
      room.timelineAction.seeked = 0;

      messageResponse = messageUtil.createUserMessage(
        room.videos.playing,
        user,
        messageUtil.MESSAGE_VIDEO_NEXT
      );
    }

    room.messages.push(messageResponse);
    socket.updateVisualsRoom(roomUnique, room);

    socket.sendToRoom(roomUnique, WS_TYPES.MESSAGE, messageResponse);
    socket.sendToRoom(roomUnique, WS_TYPES.ADD_VIDEO, {
      video,
      timelineAction: room.timelineAction,
    });
  });
}

module.exports = onAddvideo;
