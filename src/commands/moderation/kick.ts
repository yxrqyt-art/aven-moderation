import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';
import type { ModerationService } from '../../services/moderation.service.js';
import type { ModerationValidator } from '../../validators/moderation.validator.js';
import { getMemberOption } from './shared/options.js';
import { createCaseEmbed } from './shared/response.js';

export function createKickCommand(service: ModerationService, validator: ModerationValidator): Command {
  return {
    data: new SlashCommandBuilder().setName('kick').setDescription('Kick a member from the server.')
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
      .addUserOption((option) => option.setName('member').setDescription('Member to kick.').setRequired(true))
      .addStringOption((option) => option.setName('reason').setDescription('Reason for the kick.').setMaxLength(512)),
    async execute({ interaction }) {
      validator.requireGuild(interaction);
      const target = getMemberOption(interaction);
      const reason = interaction.options.getString('reason') ?? 'No reason provided.';
      const moderationCase = await service.kick({ interaction, target, reason });
      await interaction.reply({ embeds: [createCaseEmbed(moderationCase.id, 'Kick', target, reason)], ephemeral: true });
    },
  };
}
