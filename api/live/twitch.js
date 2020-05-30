const axios = require('axios');

const channels = {};

const isChannelViewerEligible = channel => {
  const selectedChannel = channels[channel];
  if (!selectedChannel) {
    return false;
  }

  const now = new Date().getTime();
  const lastPing = selectedChannel.timestamp;
  return now - lastPing < 20000; // 20 seconds
};

const createUrl = channel =>
  `https://tmi.twitch.tv/group/user/${channel}/chatters`;

function twitchLiveViewers(req, res) {
  const { channel } = req.params;

  if (isChannelViewerEligible(channel)) {
    const { totalViewers } = channels[channel];
    return res.status(200).json({ totalViewers });
  }

  axios
    .get(createUrl(channel))
    .then(response => {
      const { chatter_count } = response.data;
      channels[channel] = {
        totalViewers: chatter_count,
        timestamp: new Date().getTime(),
      };
      res.status(200).json({
        totalViewers: chatter_count,
      });
    })
    .catch(e => res.status(500).json({ e }));
}

module.exports = twitchLiveViewers;
