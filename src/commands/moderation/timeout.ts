import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';
import type { ModerationService } from '../../services/moderation.service.js';
import type { ModerationValidator } from '../../validators/moderation.validator.js';
import { getMemberOption } from './shared/options.js';
import { createCaseEmbed } from './shared/response.js';

export function createTimeoutCommand(service: ModerationService, validator: ModerationValidator): Command {
  return {
    data: new SlashCommandBuilder().setName('timeout').setDescription('Temporarily timeout a member.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) => option.setName('member').setDescription('Member to timeout.').setRequired(true))
      .addIntegerOption((option) => option.setName('minutes').setDescription('Timeout duration in minutes.').setRequired(true).setMinValue(1).setMaxValue(40320))
      .addStringOption((option) => option.setName('reason').setDescription('Reason for the timeout.').setMaxLength(512)),
    async execute({ interaction }) {
      validator.requireGuild(interaction);
      const target = getMemberOption(interaction);
      const minutes = interaction.options.getInteger('minutes', true);
      const reason = interaction.options.getString('reason') ?? 'No reason provided.';
      const moderationCase = await service.timeout({ interaction, target, reason }, minutes * 60_000);
      await interaction.reply({ embeds: [createCaseEmbed(moderationCase.id, 'Timeout', target, reason)], ephemeral: true });
    },
  };
}
