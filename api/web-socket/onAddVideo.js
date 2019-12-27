const {
  createUserMessage,
  MESSAGE_VIDEO_NEXT,
  MESSAGE_VIDEO_ADD,
} = require('../utils/message');
const createVideo = require('../utils/video');
const { MESSAGE, ADD_VIDEO } = require('./wsTypes');

function createTimeline(timelineAction) {
  return {
    ...timelineAction,
    updatedAt: new Date().getTime(),
    seeked: 0,
  };
}

function onAddvideo(socket, videoInformation) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${ADD_VIDEO} ${videoInformation.url}`);

  const user = socket.getVisualsUser(socket.id);
  createVideo(videoInformation, user).then(video => {
    if (!video) return;

    let messageResponse;
    const room = socket.getVisualsRoom(roomUnique);

    if (room.videos.playing) {
      room.videos.playlist.push(video);

      messageResponse = createUserMessage(video, user, MESSAGE_VIDEO_ADD);
    } else {
      room.timelineAction = createTimeline(room.timelineAction);

      room.videos.playing = video;
      messageResponse = createUserMessage(
        room.videos.playing,
        user,
        MESSAGE_VIDEO_NEXT
      );
    }

    room.messages.push(messageResponse);
    socket.updateVisualsRoom(roomUnique, room);

    socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
    socket.sendToRoom(roomUnique, ADD_VIDEO, {
      video,
      timelineAction: room.timelineAction,
    });
  });
}

module.exports = onAddvideo;
