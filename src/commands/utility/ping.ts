import { SlashCommandBuilder, type Client } from 'discord.js';
import type { Command } from '../../types/command.js';

export function createPingCommand(client: Client): Command {
  return {
    data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Display the current gateway latency.'),

    async execute({ interaction }) {
      await interaction.reply({
        content: `Gateway latency: ${client.ws.ping} ms`,
        ephemeral: true,
      });
    },
  };
}
