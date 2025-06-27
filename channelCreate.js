import { trackDestructiveAction } from '../utils/antiRaidManager.js';

export default {
  name: 'channelCreate',
  async execute(channel) {
    const fetchedLogs = await channel.guild.fetchAuditLogs({ type: 10, limit: 1 }); // 10 = CHANNEL_CREATE
    const entry = fetchedLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    const triggered = trackDestructiveAction(executor.id, 'channel-create');

    if (triggered) {
      try {
        const member = await channel.guild.members.fetch(executor.id);
        await member.kick('Création massive de salons détectée (anti-raid)');
        const logChannel = channel.guild.channels.cache.find(c => c.name === 'mod-logs');
        if (logChannel) logChannel.send(`⚠️ ${executor.tag} kické (création massive de salons)`);
      } catch (e) {
        console.error('Erreur channelCreate anti-raid :', e);
      }
    }
  }
};
