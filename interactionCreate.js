import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder
} from 'discord.js';

import hasAccess from '../utils/hasAccess.js';

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    const { member, guild } = interaction;
    const voiceChannel = member?.voice?.channel;

    // === BOUTONS ===
    if (interaction.isButton()) {
      const { customId } = interaction;

      if (!voiceChannel) {
        return interaction.reply({ content: '❌ Tu dois être dans ton salon vocal.', ephemeral: true });
      }

      const ownerId = guild.tempVoiceChannels?.get(voiceChannel.id);
      if (!hasAccess(member, ownerId)) {
        return interaction.reply({ content: '❌ Seul le propriétaire ou un membre autorisé peut faire ça.', ephemeral: true });
      }

      // Renommer le salon
      if (customId === 'rename_vc') {
        const modal = new ModalBuilder()
          .setCustomId('modal_rename_vc')
          .setTitle('✏️ Renommer ton salon');

        const input = new TextInputBuilder()
          .setCustomId('new_vc_name')
          .setLabel('Nom du salon')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: 🔊 Chill Zone')
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        return interaction.showModal(modal);
      }

      // Gérer l'accès (placeholder ici)
      if (customId === 'access_vc') {
        return interaction.reply({ content: '🔐 Fonction d’accès à venir.', ephemeral: true });
      }

      // Modifier le nombre de slots
      if (customId === 'slots_vc') {
        const modal = new ModalBuilder()
          .setCustomId('modal_slots_vc')
          .setTitle('👥 Limite de membres');

        const input = new TextInputBuilder()
          .setCustomId('slot_limit')
          .setLabel('Nombre de membres maximum')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: 5')
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        return interaction.showModal(modal);
      }

      // Gérer les membres
      if (customId === 'manage_users_vc') {
        const modal = new ModalBuilder()
          .setCustomId('modal_manage_user_vc')
          .setTitle('🔇 Gérer un membre');

        const input = new TextInputBuilder()
          .setCustomId('target_user_id')
          .setLabel("ID du membre à mute/kick")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        return interaction.showModal(modal);
      }

      // Kick ou mute
      if (customId.startsWith('kick_') || customId.startsWith('mute_')) {
        const targetId = customId.split('_')[1];
        const target = await guild.members.fetch(targetId).catch(() => null);

        if (!target || !target.voice.channel || target.voice.channel.id !== voiceChannel.id) {
          return interaction.reply({ content: '❌ Ce membre n’est pas dans ton salon.', ephemeral: true });
        }

        try {
          if (customId.startsWith('kick_')) {
            await target.voice.disconnect();
            return interaction.reply({ content: `✅ <@${targetId}> a été expulsé.`, ephemeral: true });
          }

          if (customId.startsWith('mute_')) {
            const mute = !target.voice.mute;
            await target.voice.setMute(mute);
            return interaction.reply({ content: `🔇 <@${targetId}> a été ${mute ? 'muté' : 'démuté'}.`, ephemeral: true });
          }
        } catch (err) {
          console.error(err);
          return interaction.reply({ content: '❌ Action impossible.', ephemeral: true });
        }
      }
    }

    // === MODALS ===
    if (interaction.isModalSubmit()) {
      // Renommage
      if (interaction.customId === 'modal_rename_vc') {
        const newName = interaction.fields.getTextInputValue('new_vc_name');
        try {
          await voiceChannel.setName(newName);
          await interaction.reply({ content: `✅ Salon renommé en \`${newName}\` !`, ephemeral: true });
        } catch (err) {
          console.error(err);
          await interaction.reply({ content: '❌ Erreur lors du renommage.', ephemeral: true });
        }
      }

      // Modifier les slots
      if (interaction.customId === 'modal_slots_vc') {
        const value = interaction.fields.getTextInputValue('slot_limit');
        const limit = parseInt(value);

        if (isNaN(limit) || limit < 0 || limit > 99) {
          return interaction.reply({ content: '❌ Entrez un nombre valide entre 0 et 99.', ephemeral: true });
        }

        try {
          await voiceChannel.setUserLimit(limit);
          return interaction.reply({ content: `✅ Limite mise à jour : ${limit} membres.`, ephemeral: true });
        } catch (err) {
          console.error(err);
          return interaction.reply({ content: '❌ Erreur lors du changement de slots.', ephemeral: true });
        }
      }

      // Gérer les membres
      if (interaction.customId === 'modal_manage_user_vc') {
        const userId = interaction.fields.getTextInputValue('target_user_id');
        const target = await guild.members.fetch(userId).catch(() => null);

        if (!target || !target.voice.channel || target.voice.channel.id !== voiceChannel.id) {
          return interaction.reply({ content: '❌ Ce membre n’est pas dans ton salon vocal.', ephemeral: true });
        }

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`kick_${userId}`).setLabel('Expulser').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(`mute_${userId}`).setLabel(target.voice.mute ? 'Unmute' : 'Mute').setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({ content: `🎯 Action sur <@${userId}>`, components: [row], ephemeral: true });
      }
    }
  }
};






