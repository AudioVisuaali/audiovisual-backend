const axios = require('axios');

const MATCH_TWITCH_VIDEO_URL = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/;

const twitchHeaders = {
  headers: {
    'Client-Id': 'btffy6z1xmhuz9yo6fg0bjhjzj3m50x',
    Accept: 'application/vnd.twitchtv.v5+json',
  },
};

const twitchVideoAddr = url => {
  const video = url.match(MATCH_TWITCH_VIDEO_URL);
  if (!video) return;

  return `https://api.twitch.tv/kraken/videos/${video[1]}`;
};

function getTwitch(url, video) {
  return axios
    .get(twitchVideoAddr(url), twitchHeaders)
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

module.exports = getTwitch;
