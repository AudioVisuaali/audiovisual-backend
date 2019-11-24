const uuidv4 = require('uuid/v4');
const axios = require('axios');
const getVideoType = require('./videoType');

const MATCH_TWITCH_CHANNEL_URL = /(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/;
const MATCH_TWITCH_VIDEO_URL = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/;
const MATCH_TWITCH_CLIP_URL = /(?:clips\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/;

const twitchHeaders = {
  headers: {
    'Client-Id': 'btffy6z1xmhuz9yo6fg0bjhjzj3m50x',
    Accept: 'application/vnd.twitchtv.v5+json',
  },
};

const youtubeAddr = url =>
  `https://www.youtube.com/oembed?url=${url}&format=json`;
const twitchAddr = url => {
  const channel = url.match(MATCH_TWITCH_CHANNEL_URL);
  if (!channel) return;

  return `https://api.twitch.tv/kraken/users?login=${channel[1]}`;
};

const twitchVideoAddr = url => {
  const video = url.match(MATCH_TWITCH_VIDEO_URL);
  if (!video) return;

  return `https://api.twitch.tv/kraken/videos/${video[1]}`;
};

const twitchClipAddr = url => {
  const video = url.match(MATCH_TWITCH_CLIP_URL);
  if (!video) return;

  return `https://api.twitch.tv/kraken/clips/${video[1]}`;
};

function createVideo(videoInformation, addedBy) {
  const video = {
    url: videoInformation.url,
    unique: uuidv4(),
    thumbnail: null,
    title: videoInformation.url,
    channel: null,
    links: {
      channel: null,
      video: null,
    },
    repeat: videoInformation,
    addedBy,
  };

  const videoType = getVideoType(videoInformation.url);

  if (!videoType) {
    return Promise.resolve(null);
  }

  video.type = videoType;

  if (videoInformation.subtitle) {
    video.subtitle = videoInformation.subtitle;
  }

  if (videoType === 'youtube') {
    return axios
      .get(youtubeAddr(videoInformation.url))
      .then(resp => {
        const { author_url, thumbnail_url, title, author_name } = resp.data;
        video.thumbnail = thumbnail_url;
        video.title = title;
        video.channel = author_name;
        video.links.channel = author_url;
        video.links.video = videoInformation.url;
        return Promise.resolve(video);
      })
      .catch(() => Promise.resolve(video));
  }

  if (videoType === 'twitch-live') {
    return axios
      .get(twitchAddr(videoInformation.url), {
        headers: {
          'Client-Id': 'btffy6z1xmhuz9yo6fg0bjhjzj3m50x',
          Accept: 'application/vnd.twitchtv.v5+json',
        },
      })
      .then(resp => {
        if (!resp.data.users) return Promise.resolve(video);

        const { display_name, logo } = resp.data.users[0];
        video.channel = display_name;
        video.thumbnail = logo;
        video.title = `Twitch - ${display_name}`;
        video.links.channel = videoInformation.url;
        video.links.video = videoInformation.url;
        return Promise.resolve(video);
      })
      .catch(() => Promise.resolve(video));
  }

  if (videoType === 'twitch') {
    return axios
      .get(twitchVideoAddr(videoInformation.url), twitchHeaders)
      .then(resp => {
        if (!resp.data) return Promise.resolve(video);
        const { channel, title, url, preview } = resp.data;
        video.channel = channel.display_name;
        video.thumbnail = preview.large;
        video.title = title;
        video.links.channel = channel.url;
        video.links.video = url;
        return Promise.resolve(video);
      })
      .catch(() => Promise.resolve(video));
  }

  if (videoType === 'twitch-clip') {
    return axios
      .get(twitchClipAddr(videoInformation.url), twitchHeaders)
      .then(resp => {
        if (!resp.data) return Promise.resolve(video);
        const { broadcaster, curator, title, url, thumbnails } = resp.data;
        video.url = thumbnails.medium.split('-preview')[0] + '.mp4';
        video.channel = broadcaster.display_name;
        video.thumbnail = thumbnails.medium;
        video.title = title;
        video.links.channel = curator.channel_url;
        video.links.video = url;
        return Promise.resolve(video);
      })
      .catch(() => Promise.resolve(video));
  }

  return Promise.resolve(video);
}

module.exports = createVideo;
