import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';
import type { ModerationService } from '../../services/moderation.service.js';
import type { ModerationValidator } from '../../validators/moderation.validator.js';
import { getMemberOption } from './shared/options.js';
import { createCaseEmbed } from './shared/response.js';

export function createWarnCommand(service: ModerationService, validator: ModerationValidator): Command {
  return {
    data: new SlashCommandBuilder().setName('warn').setDescription('Add a warning to a member.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) => option.setName('member').setDescription('Member to warn.').setRequired(true))
      .addStringOption((option) => option.setName('reason').setDescription('Reason for the warning.').setRequired(true).setMaxLength(512)),
    async execute({ interaction }) {
      validator.requireGuild(interaction);
      const target = getMemberOption(interaction);
      const reason = interaction.options.getString('reason', true);
      const moderationCase = service.warn({ interaction, target, reason });
      await interaction.reply({ embeds: [createCaseEmbed(moderationCase.id, 'Warning', target, reason)], ephemeral: true });
    },
  };
}
