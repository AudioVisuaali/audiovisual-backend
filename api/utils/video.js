const uuidv4 = require('uuid/v4');
const axios = require('axios');

const addr = url => `https://www.youtube.com/oembed?url=${url}&format=json`;

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
    addedBy,
  };

  if (videoInformation.subtitle) {
    video.subtitle = videoInformation.subtitle;
  }

  return axios
    .get(addr(videoInformation.url))
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

module.exports = createVideo;
