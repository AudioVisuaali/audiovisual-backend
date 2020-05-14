const axios = require('axios');

const MATCH_TWITCH_CLIP_URL = /(?:clips\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/;

const twitchHeaders = {
  headers: {
    'Client-Id': 'btffy6z1xmhuz9yo6fg0bjhjzj3m50x',
    Accept: 'application/vnd.twitchtv.v5+json',
  },
};

const twitchClipAddr = url => {
  const video = url.match(MATCH_TWITCH_CLIP_URL);
  if (!video) return;

  return `https://api.twitch.tv/kraken/clips/${video[1]}`;
};

function getTwitchClip(url, video) {
  return axios
    .get(twitchClipAddr(url), twitchHeaders)
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

module.exports = getTwitchClip;
