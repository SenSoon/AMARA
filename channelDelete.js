import { trackDestructiveAction } from '../utils/antiRaidManager.js';

export default {
  name: 'channelDelete',
  async execute(channel) {
    const fetchedLogs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }); // 12 = CHANNEL_DELETE
    const entry = fetchedLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    const triggered = trackDestructiveAction(executor.id, 'channel-delete');

    if (triggered) {
      try {
        const member = await channel.guild.members.fetch(executor.id);
        await member.kick('Suppression massive de salons détectée (anti-raid)');
        const logChannel = channel.guild.channels.cache.find(c => c.name === 'mod-logs');
        if (logChannel) logChannel.send(`⚠️ ${executor.tag} kické (suppression massive de salons)`);
      } catch (e) {
        console.error('Erreur channelDelete anti-raid :', e);
      }
    }
  }
};
