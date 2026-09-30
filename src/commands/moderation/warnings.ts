import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';
import type { ModerationCaseRepository } from '../../repositories/moderation-case.repository.js';
import type { ModerationValidator } from '../../validators/moderation.validator.js';
import { getMemberOption } from './shared/options.js';

export function createWarningsCommand(
  cases: ModerationCaseRepository,
  validator: ModerationValidator,
): Command {
  return {
    data: new SlashCommandBuilder().setName('warnings').setDescription('View a member’s warnings.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) => option.setName('member').setDescription('Member whose warnings should be displayed.').setRequired(true)),
    async execute({ interaction }) {
      validator.requireGuild(interaction);
      validator.requireActorPermission(interaction, PermissionFlagsBits.ModerateMembers);
      const target = getMemberOption(interaction);
      const entries = cases.findWarnings(interaction.guildId, target.id);
      const description = entries.length === 0
        ? 'No warnings found.'
        : entries.slice(0, 10).map((entry) => `**#${entry.id}** — ${entry.reason}\n<t:${Math.floor(new Date(entry.createdAt).getTime() / 1000)}:R>`).join('\n\n');
      await interaction.reply({ embeds: [new EmbedBuilder().setTitle(`Warnings — ${target.user.tag}`).setDescription(description)], ephemeral: true });
    },
  };
}
