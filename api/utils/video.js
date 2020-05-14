const uuidv4 = require('uuid/v4');
const getVideoType = require('./videoType');

const getYoutube = require('./video-data/youtube');
const getTwitchLine = require('./video-data/twitch-live');
const getTwitch = require('./video-data/twitch');
const getTikTok = require('./video-data/tik-tok');
const getTwitchClip = require('./video-data/twitch-clip');

const generateBasicVideo = (videoInformation, addedBy) => ({
  url: videoInformation.url,
  unique: uuidv4(),
  thumbnail: null,
  title: videoInformation.title || videoInformation.url,
  channel: null,
  links: {
    channel: null,
    video: null,
  },
  repeat: videoInformation,
  addedBy,
});

function createVideo(videoInformation, addedBy) {
  const video = generateBasicVideo(videoInformation, addedBy);

  const videoType = getVideoType(videoInformation.url);
  video.type = videoType;

  if (!videoType) {
    return Promise.resolve(null);
  }

  // Subtitle

  if (videoInformation.subtitle) {
    video.subtitle = videoInformation.subtitle;
  }

  // Platforms

  if (videoType === 'youtube') {
    return getYoutube(videoInformation.url, video);
  }

  if (videoType === 'twitch-live') {
    return getTwitchLine(videoInformation.url, video);
  }

  if (videoType === 'twitch') {
    return getTwitch(videoInformation.url, video);
  }

  if (videoType === 'tik-tok') {
    return getTikTok(videoInformation.url, video);
  }

  if (videoType === 'twitch-clip') {
    return getTwitchClip(videoInformation.url, video);
  }

  if (videoType === 'file') {
    // Set video name as filename
    if (!videoInformation.title) {
      const newTitle = videoInformation.url.split('/').pop();
      const titleSeperated = newTitle.split('.');
      if (titleSeperated.length > 1) {
        titleSeperated.pop();
      }
      video.title = titleSeperated[0];
    }
  }

  return Promise.resolve(video);
}

module.exports = createVideo;
