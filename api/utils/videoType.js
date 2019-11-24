const MATCH_TWITCH_VIDEO_URL = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/;
const MATCH_TWITCH_CHANNEL_URL = /(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/;
const MATCH_TWITCH_CLIP_URL = /(?:clips\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/;
const MATCH_VIMEO_URL = /vimeo\.com\/.+/;
const MATCH_VIMEO_FILE_URL = /vimeo\.com\/external\/[0-9]+\..+/;
const MATCH_YOUTUBE_URL = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=/;
// const MATCH_YOUTUBE_PLAYLIST = /list=([a-zA-Z0-9_-]+)/;
const MATCH_SOUNDCLOUD_URL = /(soundcloud\.com|snd\.sc)\/.+$/;
const MATCH_STREAMABLE_URL = /streamable\.com\/([a-z0-9]+)$/;
const MATCH_FACEBOOK_URL = /facebook\.com\/([^/?].+\/)?video(s|\.php)[/?].*$/;
const MATCH_MIXCLOUD_URL = /mixcloud\.com\/([^/]+\/[^/]+)/;
const MATCH_WISTIA_URL = /(?:wistia\.com|wi\.st)\/(?:medias|embed)\/(.*)$/;

const AUDIO_EXTENSIONS = /\.(m4a|mp4a|mpga|mp2|mp2a|mp3|m2a|m3a|wav|weba|aac|oga|spx)($|\?)/i;
const VIDEO_EXTENSIONS = /\.(mp4|og[gv]|webm|mov|m4v)($|\?)/i;
const HLS_EXTENSIONS = /\.(m3u8)($|\?)/i;
const DASH_EXTENSIONS = /\.(mpd)($|\?)/i;
const MATCH_DAILYMOTION_URL = /^(?:(?:https?):)?(?:\/\/)?(?:www\.)?(?:(?:dailymotion\.com(?:\/embed)?\/video)|dai\.ly)\/([a-zA-Z0-9]+)(?:_[\w_-]+)?$/;

const matches = [
  {
    pattern: MATCH_TWITCH_VIDEO_URL,
    name: 'twitch',
  },
  {
    pattern: MATCH_TWITCH_CHANNEL_URL,
    name: 'twitch-live',
  },
  {
    pattern: MATCH_TWITCH_CLIP_URL,
    name: 'twitch-clip',
  },
  {
    pattern: MATCH_VIMEO_URL,
    name: 'vimeo',
  },
  {
    pattern: MATCH_VIMEO_FILE_URL,
    name: 'vimeo',
  },
  {
    pattern: MATCH_YOUTUBE_URL,
    name: 'youtube',
  },
  {
    pattern: MATCH_SOUNDCLOUD_URL,
    name: 'soundcloud',
  },
  {
    pattern: MATCH_STREAMABLE_URL,
    name: 'streamable',
  },
  {
    pattern: AUDIO_EXTENSIONS,
    name: 'file',
  },
  {
    pattern: VIDEO_EXTENSIONS,
    name: 'file',
  },
  {
    pattern: HLS_EXTENSIONS,
    name: 'file',
  },
  {
    pattern: DASH_EXTENSIONS,
    name: 'file',
  },
  {
    pattern: MATCH_FACEBOOK_URL,
    name: 'facebook',
  },
  {
    pattern: MATCH_DAILYMOTION_URL,
    name: 'dailymotion',
  },
  {
    pattern: MATCH_MIXCLOUD_URL,
    name: 'mixcloud',
  },
  {
    pattern: MATCH_WISTIA_URL,
    name: 'wistia',
  },
];

function getVideoType(url) {
  const match = matches.find(match => url.match(match.pattern));

  return match ? match.name : null;
}

module.exports = getVideoType;
