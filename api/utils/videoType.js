const MATCH_TWITCH_VIDEO_URL = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/;
const MATCH_TWITCH_CHANNEL_URL = /(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/;
const MATCH_VIMEO_URL = /vimeo\.com\/.+/;
const MATCH_VIMEO_FILE_URL = /vimeo\.com\/external\/[0-9]+\..+/;
const MATCH_YOUTUBE_URL = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=/;
// const MATCH_YOUTUBE_PLAYLIST = /list=([a-zA-Z0-9_-]+)/;
const MATCH_SOUNDCLOUD_URL = /(soundcloud\.com|snd\.sc)\/.+$/;
const MATCH_STREAMABLE_URL = /streamable\.com\/([a-z0-9]+)$/;

const AUDIO_EXTENSIONS = /\.(m4a|mp4a|mpga|mp2|mp2a|mp3|m2a|m3a|wav|weba|aac|oga|spx)($|\?)/i;
const VIDEO_EXTENSIONS = /\.(mp4|og[gv]|webm|mov|m4v)($|\?)/i;
const HLS_EXTENSIONS = /\.(m3u8)($|\?)/i;
const DASH_EXTENSIONS = /\.(mpd)($|\?)/i;

function getVideoType(url) {
  const twitchVideoMatch = url.match(MATCH_TWITCH_VIDEO_URL);
  if (twitchVideoMatch) {
    return 'twitch';
  }

  const twitchChannelMatch = url.match(MATCH_TWITCH_CHANNEL_URL);
  if (twitchChannelMatch) {
    return 'twitch-live';
  }

  const vimeoURLMatch = url.match(MATCH_VIMEO_URL);
  if (vimeoURLMatch) {
    return 'vimeo';
  }

  const vimeoFileMatch = url.match(MATCH_VIMEO_FILE_URL);
  if (vimeoFileMatch) {
    return 'vimeo';
  }

  const youtubeMatch = url.match(MATCH_YOUTUBE_URL);
  if (youtubeMatch) {
    return 'youtube';
  }

  const soundcloudMatch = url.match(MATCH_SOUNDCLOUD_URL);
  if (soundcloudMatch) {
    return 'soundcloud';
  }

  const streamableMatch = url.match(MATCH_STREAMABLE_URL);
  if (streamableMatch) {
    return 'streamable';
  }

  const audioMatch = url.match(AUDIO_EXTENSIONS);
  if (audioMatch) {
    return 'file';
  }

  const videoMatch = url.match(VIDEO_EXTENSIONS);
  if (videoMatch) {
    return 'file';
  }

  const hlsMatch = url.match(HLS_EXTENSIONS);
  if (hlsMatch) {
    return 'file';
  }

  const dashMatch = url.match(DASH_EXTENSIONS);
  if (dashMatch) {
    return 'file';
  }

  return null;
}

module.exports = getVideoType;
