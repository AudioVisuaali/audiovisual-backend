const axios = require('axios');

const MATCH_TIKTOK_URL = /(?:www\.)?tiktok\.com\/[a-zA-Z0-9_@.-]+\/video\/([a-zA-Z0-9_@-]+)($|\?)/;
const MATCH_TIKTOK_M = /m\.tiktok\.com\/v\/([a-zA-Z0-9_@-]+)($|\.?)/;
const MATCH_TIKTOK_URL_VM = /vm.tiktok\.com\/([a-zA-Z0-9_@-]+)($|\?)/;

const tiktokApiAddr = videoId =>
  `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@placeholder/video/${videoId}`;

const tiktokFileAddr = videoId => `https://www.tiktok.com/embed/v2/${videoId}`;

const getFileAddr = string => {
  const [, urlStart] = string.split(
    '_embed_player_video-wrapper"><video src="'
  );
  const [url] = urlStart.split('?');
  return url;
};

const generateTiktokWithVideoId = (videoId, video) => {
  return Promise.all([
    axios.get(tiktokApiAddr(videoId)),
    axios.get(tiktokFileAddr(videoId)),
  ]).then(values => {
    const {
      title,
      author_url,
      author_name,
      thumbnail_url,
      html,
    } = values[0].data;

    video.url = getFileAddr(values[1].data) + '?.mp4';
    video.thumbnail = thumbnail_url;
    video.title = title || author_name;
    video.channel = `@${author_name}`;
    video.links.channel = author_url;
    video.links.video = html.split('cite="')[1].split('"')[0];

    return Promise.resolve(video);
  });
};

async function getTikTok(url, video) {
  const match = url.match(MATCH_TIKTOK_URL);
  if (match) {
    return generateTiktokWithVideoId(match[1], video);
  }

  const matchM = url.match(MATCH_TIKTOK_M);
  if (matchM) {
    return generateTiktokWithVideoId(matchM[1], video);
  }

  const matchVM = url.match(MATCH_TIKTOK_URL_VM);
  if (matchVM) {
    return axios.get(`http://vm.tiktok.com/${matchVM[1]}`).then(res => {
      const matchVM_M = res.request.res.responseUrl.match(MATCH_TIKTOK_M);
      if (matchVM_M) {
        return generateTiktokWithVideoId(matchVM_M[1], video);
      }
    });
  }
  console.log('nomatch');
}

module.exports = getTikTok;
