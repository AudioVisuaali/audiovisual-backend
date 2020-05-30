const {
  createUserMessage,
  MESSAGE_VIDEO_NEXT,
  MESSAGE_VIDEO_ADD,
} = require('../utils/message');
const createVideo = require('../utils/video');
const { MESSAGE, ADD_VIDEO } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

function createTimeline(timelineAction) {
  return {
    ...timelineAction,
    updatedAt: new Date().getTime(),
    seeked: 0,
  };
}

function onAddvideo(socket, data) {
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${ADD_VIDEO} ${data.url}`);

  const user = users.getById(socket.id); // socket.getVisualsUser(socket.id);

  createVideo(data, user).then(video => {
    if (!video) return;

    let messageResponse;
    const room = rooms.getById(roomUnique);

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
    rooms.update(roomUnique, room);

    socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
    socket.sendToRoom(roomUnique, ADD_VIDEO, {
      video,
      timelineAction: room.timelineAction,
    });
  });
}

module.exports = onAddvideo;
