const { AttachmentBuilder } = require('discord.js');

module.exports = async function generateTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const content = messages
    .reverse()
    .map(m => `${m.author.tag}: ${m.cleanContent}`)
    .join('\n');

  const buffer = Buffer.from(content, 'utf-8');
  return new AttachmentBuilder(buffer, { name: `${channel.name}.txt` });
};
