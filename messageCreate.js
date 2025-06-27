import { trackMessage } from '../utils/antiRaidManager.js';
import fs from 'fs';

export default {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // 🔒 Anti-raid (anti-spam)
    const isSpam = trackMessage(message);
    if (isSpam) {
      try {
        await message.member.timeout(60_000, 'Spam détecté par le système anti-raid');
        await message.channel.send(`⚠️ ${message.author} a été timeout pour spam.`);
      } catch (e) {
        console.error('Erreur anti-raid (message) :', e);
      }
    }

    // 📢 Détection de soutien
    const supportConfig = JSON.parse(fs.readFileSync('./data/support.json', 'utf8'));
    const { keywords, roleId, thankMessage } = supportConfig;

    if (keywords.some(kw => message.content.toLowerCase().includes(kw.toLowerCase()))) {
      const role = message.guild.roles.cache.get(roleId);
      if (role && !message.member.roles.cache.has(roleId)) {
        try {
          await message.member.roles.add(role);
          await message.reply(thankMessage.replace('{user}', message.author));
        } catch (err) {
          console.error('Erreur attribution rôle de soutien :', err);
        }
      }
    }

    // ⚙️ Commandes prefix
    const prefix = process.env.PREFIX;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    if (command.ownerOnly && message.author.id !== process.env.OWNER_ID) {
      return message.reply("Tu n'as pas la permission d'utiliser cette commande.");
    }

    try {
      command.execute(message, args, client);
    } catch (err) {
      console.error(`Erreur sur la commande ${commandName} :`, err);
      message.reply("Une erreur est survenue lors de l'exécution de la commande.");
    }
  }
};



