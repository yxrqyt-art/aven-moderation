import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';
import type { ModerationService } from '../../services/moderation.service.js';
import type { ModerationValidator } from '../../validators/moderation.validator.js';
import { getMemberOption } from './shared/options.js';
import { createCaseEmbed } from './shared/response.js';

export function createUntimeoutCommand(service: ModerationService, validator: ModerationValidator): Command {
  return {
    data: new SlashCommandBuilder().setName('untimeout').setDescription('Remove a member timeout.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) => option.setName('member').setDescription('Member to remove from timeout.').setRequired(true))
      .addStringOption((option) => option.setName('reason').setDescription('Reason for removing the timeout.').setMaxLength(512)),
    async execute({ interaction }) {
      validator.requireGuild(interaction);
      const target = getMemberOption(interaction);
      const reason = interaction.options.getString('reason') ?? 'No reason provided.';
      const moderationCase = await service.untimeout({ interaction, target, reason });
      await interaction.reply({ embeds: [createCaseEmbed(moderationCase.id, 'Timeout removed', target, reason)], ephemeral: true });
    },
  };
}
