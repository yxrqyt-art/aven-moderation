import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';
import type { ModerationValidator } from '../../validators/moderation.validator.js';
import { ApplicationError } from '../../errors/application.error.js';

export function createPurgeCommand(validator: ModerationValidator): Command {
  return {
    data: new SlashCommandBuilder().setName('purge').setDescription('Delete recent messages from the current channel.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .addIntegerOption((option) => option.setName('amount').setDescription('Number of messages to delete.').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute({ interaction }) {
      validator.requireGuild(interaction);
      validator.validatePurgePermission(interaction);
      const amount = interaction.options.getInteger('amount', true);
      const channel = interaction.channel;
      if (!channel?.isTextBased() || channel.isDMBased() || !('bulkDelete' in channel)) {
        throw new ApplicationError('Purge used in unsupported channel.', 'This command cannot be used in this channel.');
      }
      const deleted = await channel.bulkDelete(amount, true);
      await interaction.reply({ content: `Deleted ${deleted.size} message${deleted.size === 1 ? '' : 's'}.`, ephemeral: true });
    },
  };
}
