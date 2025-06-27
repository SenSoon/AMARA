import fs from 'fs';
import { AuditLogEvent } from 'discord.js';
import { trackAction, getActionCount, resetTracker } from '../utils/antiraidTrackers.js';

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync('./data/antiraid-config.json'));
  } catch {
    return { enabled: false, whitelist: [] };
  }
}

async function notifyWhitelist(guild, content) {
  const config = loadConfig();
  for (const id of config.whitelist || []) {
    try {
      const user = await guild.client.users.fetch(id);
      await user.send(content).catch(() => {});
    } catch {}
  }
}

async function handleAction(guild, actionType, targetName) {
  const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent[actionType] });
  const log = fetchedLogs.entries.first();
  if (!log) return;

  const { executor } = log;
  const executorId = executor.id;

  // Suivre l’action
  const trackingKey = {
    ChannelCreate: 'channelCreations',
    ChannelDelete: 'channelDeletions',
    RoleCreate: 'roleCreations',
    RoleDelete: 'roleDeletions',
  }[actionType];

  if (!trackingKey) return;

  trackAction(trackingKey, executorId);

  // Si l’utilisateur dépasse le seuil
  if (getActionCount(trackingKey, executorId) > 5) {
    await notifyWhitelist(
      guild,
      `⚠️ **Action suspecte détectée**\n> L'utilisateur **${executor.tag}** a effectué plusieurs actions de type \`${actionType}\`.\n> Dernier élément concerné : \`${targetName}\``
    );
  }
}

export function setupDestructiveListeners(client) {
  const config = loadConfig();
  if (!config.enabled) return;

  console.log("✅ Protection anti-raid activée.");

  client.on('channelCreate', channel => {
    handleAction(channel.guild, 'ChannelCreate', channel.name);
  });

  client.on('channelDelete', channel => {
    handleAction(channel.guild, 'ChannelDelete', channel.name);
  });

  client.on('roleCreate', role => {
    handleAction(role.guild, 'RoleCreate', role.name);
  });

  client.on('roleDelete', role => {
    handleAction(role.guild, 'RoleDelete', role.name);
  });
}