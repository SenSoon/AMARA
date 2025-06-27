import fs from 'fs';
import path from 'path';
import {
  ChannelType,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder
} from 'discord.js';

export default {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const filePath = path.resolve('data/joinToCreate.json');
    if (!fs.existsSync(filePath)) return;

    const { channelId: baseChannelId } = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!baseChannelId) return;

    const member = newState.member;
    const guild = newState.guild;

    // Création du salon temporaire
    if (!oldState.channelId && newState.channelId === baseChannelId) {
      const channelName = `🔊 ${member.user.username}`;

      const tempChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: newState.channel?.parentId ?? null,
        permissionOverwrites: [
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.ViewChannel
            ],
          },
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
          }
        ]
      });

      await member.voice.setChannel(tempChannel);

      if (!guild.tempVoiceChannels) guild.tempVoiceChannels = new Map();
      guild.tempVoiceChannels.set(tempChannel.id, member.id);

      // Récupérer le salon thread intégré (chat vocal)
      const threads = (await guild.channels.fetch()).filter(c => c.isThread());
      const possibleThreads = threads.filter(t => t.parentId === tempChannel.id);

      const textChannel = possibleThreads.first();

      if (!textChannel) {
        console.warn('⚠️ Aucun chat vocal intégré trouvé pour ce salon.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle('🎛️ Contrôle du salon vocal')
        .setDescription(`Salon de <@${member.id}>`)
        .addFields(
          { name: '✏️ Nom', value: 'Renommer le salon', inline: true },
          { name: '🔐 Accès', value: 'Gérer les permissions', inline: true },
          { name: '👥 Slots', value: 'Modifier le nombre de membres', inline: true },
          { name: '🔇 Gérer Membres', value: 'Mute / Kick un membre', inline: true }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('rename_vc').setLabel('✏️ Renommer').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('access_vc').setLabel('🔐 Accès').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('slots_vc').setLabel('👥 Slots').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('manage_users_vc').setLabel('🔇 Gérer Membres').setStyle(ButtonStyle.Secondary)
      );

      await textChannel.send({ embeds: [embed], components: [row] });
    }

    // Suppression du salon temporaire vide
    if (oldState.channelId && guild.tempVoiceChannels?.has(oldState.channelId)) {
      const channel = oldState.channel;
      if (channel.members.size === 0) {
        await channel.delete().catch(() => null);
        guild.tempVoiceChannels.delete(channel.id);
      }
    }
  }
};



