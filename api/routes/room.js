const rooms = require('../store/rooms');

const SHOW_VIEWER_MAX_COUNT = 4;
function generateViewers(viewers) {
  if (!viewers.length) {
    return 'No one is';
  }

  if (viewers.length === 1) {
    return `${viewers[0].username} is`;
  }

  if (viewers.length > SHOW_VIEWER_MAX_COUNT) {
    const excludedViewers = viewers.length - SHOW_VIEWER_MAX_COUNT;
    return (
      viewers
        .slice(0, SHOW_VIEWER_MAX_COUNT)
        .map(viewer => viewer.username)
        .join(', ') + `, +${excludedViewers} more are`
    );
  }

  return (
    viewers
      .slice(0, viewers.length - 1)
      .map(viewer => viewer.username)
      .join(', ') + ` and ${viewers[viewers.length - 1].username} are`
  );
}

const descriptionDefault = { viewers: [], videos: { playing: null } };
function generateDescription(room_) {
  const room = room_ || descriptionDefault;
  const currentViewers = room.viewers.length;
  const isCurrentVideo = room.videos.playing;

  if (!currentViewers && !isCurrentVideo) {
    return 'Join room to watch videos';
  }

  const viewers = generateViewers(room.viewers);

  if (currentViewers && !isCurrentVideo) {
    return `${viewers} waiting to watch videos`;
  }

  const videoTitle = room.videos.playing.title;
  return `${viewers} watching ${videoTitle}`;
}

const queueDefault = { videos: { playlist: [] } };
function generateQueue(room_) {
  const room = room_ || queueDefault;

  const playlistLength = room.videos.playlist.length;
  if (!playlistLength) {
    return 'No videos in queue';
  }

  return `${playlistLength} video${playlistLength === 1 ? '' : 's'} in queue`;
}

function renderRoomWithMeta(req, res) {
  const { roomId } = req.params;
  const room = rooms.getById(req.params.roomId);

  const queue = generateQueue(room);
  const description = `${generateDescription(room)} | ${queue}`;
  const title = `Visuals - ${roomId}`;

  res.render('room', {
    title,
    metaDescription: description,
    metaOGTitle: title,
    metaOGDescription: description,
  });
}

module.exports = renderRoomWithMeta;
