import { trackJoin } from '../utils/antiRaidManager.js';

export default {
  name: 'guildMemberAdd',

  async execute(member) {
    const raidDetected = trackJoin(member);

    if (raidDetected) {
      try {
        await member.kick('Détection anti-raid : trop de joins');

        const logChannel = member.guild.channels.cache.find(c => c.name === 'mod-logs' && c.isTextBased());
        if (logChannel) {
          logChannel.send(`⚠️ Membre ${member.user.tag} kické automatiquement (anti-raid).`);
        }
      } catch (e) {
        console.error('Erreur anti-raid (join) :', e);
      }

      return;
    }

    // 👋 Message de bienvenue + suppression
    try {
      const welcomeChannelId = '123456789012345678'; // Remplace par ton salon texte
      const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

      if (!welcomeChannel || !welcomeChannel.isTextBased()) return;

      const message = await welcomeChannel.send(`👋 Bienvenue ${member} !`);

      setTimeout(() => {
        message.delete().catch(() => {});
      }, 5000);
    } catch (err) {
      console.error('Erreur message de bienvenue :', err);
      console.log(`${member.user.tag} a rejoint le serveur.`);
    }
  }
};
