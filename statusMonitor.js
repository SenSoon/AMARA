import { Events } from 'discord.js';
import { loadStatusConfig } from '../utils/statusConfig.js';

export default {
  name: Events.PresenceUpdate,
  async execute(oldPresence, newPresence) {
    const member = newPresence.member;
    if (!member || member.user.bot) return;

    const config = loadStatusConfig();
    if (!config.enabled || !config.roleId || config.keywords.length === 0) return;

    const status = newPresence.activities.find(a => a.type === 4); // CUSTOM_STATUS
    const text = status?.state?.toLowerCase() || '';

    const hasKeyword = config.keywords.some(k => text.includes(k.toLowerCase()));
    const role = newPresence.guild.roles.cache.get(config.roleId);
    if (!role) return;

    if (hasKeyword && !member.roles.cache.has(role.id)) {
      await member.roles.add(role).catch(() => {});
    } else if (!hasKeyword && member.roles.cache.has(role.id)) {
      await member.roles.remove(role).catch(() => {});
    }
  }
};