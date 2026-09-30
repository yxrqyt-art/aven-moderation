import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';
import type { ModerationCaseRepository } from '../../repositories/moderation-case.repository.js';
import type { ModerationValidator } from '../../validators/moderation.validator.js';
import { getMemberOption } from './shared/options.js';

export function createClearWarningsCommand(cases: ModerationCaseRepository, validator: ModerationValidator): Command {
  return {
    data: new SlashCommandBuilder().setName('clearwarnings').setDescription('Clear all warnings for a member.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) => option.setName('member').setDescription('Member whose warnings should be cleared.').setRequired(true)),
    async execute({ interaction }) {
      validator.requireGuild(interaction);
      const target = getMemberOption(interaction);
      validator.validateTarget(interaction, target, PermissionFlagsBits.ModerateMembers);
      const removed = cases.clearWarnings(interaction.guildId, target.id);
      await interaction.reply({ content: `Cleared ${removed} warning${removed === 1 ? '' : 's'} for ${target.user.tag}.`, ephemeral: true });
    },
  };
}
