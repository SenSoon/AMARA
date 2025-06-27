import { trackDestructiveAction } from '../utils/antiRaidManager.js';

export default {
  name: 'roleCreate',
  async execute(role) {
    const fetchedLogs = await role.guild.fetchAuditLogs({ type: 30, limit: 1 }); // 30 = ROLE_CREATE
    const entry = fetchedLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    const triggered = trackDestructiveAction(executor.id, 'role-create');

    if (triggered) {
      try {
        const member = await role.guild.members.fetch(executor.id);
        await member.kick('Création massive de rôles détectée (anti-raid)');
        const logChannel = role.guild.channels.cache.find(c => c.name === 'mod-logs');
        if (logChannel) logChannel.send(`⚠️ ${executor.tag} kické (création massive de rôles)`);
      } catch (e) {
        console.error('Erreur roleCreate anti-raid :', e);
      }
    }
  }
};
