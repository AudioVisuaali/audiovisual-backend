const axios = require('axios');

const youtubeAddr = url =>
  `https://www.youtube.com/oembed?url=${url}&format=json`;

function getYoutube(url, video) {
  return axios
    .get(youtubeAddr(url))
    .then(resp => {
      const { author_url, thumbnail_url, title, author_name } = resp.data;
      video.thumbnail = thumbnail_url;
      video.title = title;
      video.channel = author_name;
      video.links.channel = author_url;
      video.links.video = url;
      return Promise.resolve(video);
    })
    .catch(() => Promise.resolve(video));
}

module.exports = getYoutube;
