const axios = require('axios');

const MATCH_TWITCH_CHANNEL_URL = /(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/;

const twitchHeaders = {
  headers: {
    'Client-Id': 'btffy6z1xmhuz9yo6fg0bjhjzj3m50x',
    Accept: 'application/vnd.twitchtv.v5+json',
  },
};

const twitchAddr = url => {
  const channel = url.match(MATCH_TWITCH_CHANNEL_URL);
  if (!channel) return;

  return `https://api.twitch.tv/kraken/users?login=${channel[1]}`;
};

function getTwitchLine(url, video) {
  return axios
    .get(twitchAddr(url), twitchHeaders)
    .then(resp => {
      if (!resp.data.users) return Promise.resolve(video);

      const { display_name, logo } = resp.data.users[0];
      video.channel = display_name;
      video.thumbnail = logo;
      video.title = `Twitch - ${display_name}`;
      video.links.channel = url;
      video.links.video = url;
      return Promise.resolve(video);
    })
    .catch(() => Promise.resolve(video));
}

module.exports = getTwitchLine;
