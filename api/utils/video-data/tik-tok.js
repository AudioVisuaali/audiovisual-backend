const axios = require('axios');

const MATCH_TIKTOK_URL = /(?:www\.)?tiktok\.com\/[a-zA-Z0-9_@-]+\/video\/([a-zA-Z0-9_@-]+)($|\?)/;

const tiktokApiAddr = url => `https://www.tiktok.com/oembed?url=${url}`;

const tiktokFileAddr = url => {
  const video = url.match(MATCH_TIKTOK_URL);
  if (!video) return;

  return `https://www.tiktok.com/embed/v2/${video[1]}`;
};

const getFileAddr = string => {
  const [, urlStart] = string.split(
    '_embed_player_video-wrapper"><video src="'
  );
  const [url] = urlStart.split('?');
  return url;
};

function getTikTok(url, video) {
  return Promise.all([
    axios.get(tiktokApiAddr(url)),
    axios.get(tiktokFileAddr(url)),
  ]).then(values => {
    const { title, author_url, author_name, thumbnail_url } = values[0].data;

    video.url = getFileAddr(values[1].data) + '?.mp4';
    video.thumbnail = thumbnail_url;
    video.title = title || author_name;
    video.channel = author_name;
    video.links.channel = author_url;
    video.links.video = url;

    return Promise.resolve(video);
  });
}

module.exports = getTikTok;

/*

.then(resp => {
      return Promise.resolve(video)
      console.log(resp);
      if (!resp.data) return Promise.resolve(video);
      const { title, author_url, author_name, thumbnail_url } = resp.data;
      const dom = new JSDOM(resp.data);
      const { document } = dom.window;

      const videoEl = document.getElementsByClassName(
        '_embed_player_video-item'
      )[0];

      video.url = videoEl.src.split('?')[0] + '?.mp4';

      video.thumbnail = thumbnail_url;
      video.title = title;
      video.channel = author_name;
      video.links.channel = author_url;
      video.links.video = url;
      return Promise.resolve(video);
    })
*/
