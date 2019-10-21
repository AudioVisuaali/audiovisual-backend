const uuidv4 = require('uuid/v4');

const MESSAGE_USER = 'user';
const MESSAGE_VIDEO_IS_PLAYING = 'is-playing';
const MESSAGE_VIDEO_SEEK = 'video-seek';
const MESSAGE_VIDEO_SKIP = 'video-skip';
const MESSAGE_VIDEO_NEXT = 'video-next';
const MESSAGE_VIDEO_ADD = 'video-add';
const MESSAGE_VIDEO_DELETE = 'video-delete';
const MESSAGE_USER_USERNAME_CHANGE = 'user-username-change';
const MESSAGE_USER_JOIN = 'user-join';
const MESSAGE_USER_LEAVE = 'user-leave';
const MESSAGE_VIDEO_PALAY_ORDER = 'video-play-order';

function createUserMessage(content, user, type) {
  return {
    createdAt: new Date().toString(),
    unique: uuidv4(),
    type: type,
    user,
    content,
  };
}

module.exports = {
  createUserMessage,
  MESSAGE_USER,
  MESSAGE_VIDEO_IS_PLAYING,
  MESSAGE_VIDEO_SEEK,
  MESSAGE_VIDEO_SKIP,
  MESSAGE_VIDEO_NEXT,
  MESSAGE_VIDEO_ADD,
  MESSAGE_VIDEO_DELETE,
  MESSAGE_USER_USERNAME_CHANGE,
  MESSAGE_USER_JOIN,
  MESSAGE_USER_LEAVE,
  MESSAGE_VIDEO_PALAY_ORDER,
};
