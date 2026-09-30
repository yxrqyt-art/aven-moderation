import {
  Events,
  type Client,
  type Interaction,
} from 'discord.js';
import { ApplicationError } from '../errors/application.error.js';
import type { Command } from '../types/command.js';
import type { Logger } from '../services/logger.service.js';

async function handleInteraction(
  interaction: Interaction,
  commands: ReadonlyMap<string, Command>,
  logger: Logger,
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    logger.warn('Received an unknown command.', { command: interaction.commandName });
    return;
  }

  try {
    await command.execute({ interaction });
  } catch (error: unknown) {
    logger.error('Command execution failed.', {
      command: interaction.commandName,
      error: error instanceof Error ? error.message : String(error),
    });

    const message = error instanceof ApplicationError
      ? error.userMessage
      : 'An unexpected error occurred while processing this command.';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true }).catch(() => undefined);
    } else {
      await interaction.reply({ content: message, ephemeral: true }).catch(() => undefined);
    }
  }
}

export function registerInteractionHandler(
  client: Client,
  commands: ReadonlyMap<string, Command>,
  logger: Logger,
): void {
  client.on(Events.InteractionCreate, (interaction) => {
    void handleInteraction(interaction, commands, logger);
  });
}
