import {
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';
import { environment } from './config/environment.js';
import { DatabaseClient } from './database/client.js';
import { ModerationCaseRepository } from './repositories/moderation-case.repository.js';
import { Logger } from './services/logger.service.js';
import { ModerationValidator } from './validators/moderation.validator.js';
import { ModerationService } from './services/moderation.service.js';
import { createModerationCommands } from './commands/moderation/index.js';
import { createPingCommand } from './commands/utility/ping.js';
import { registerInteractionHandler } from './events/interaction-create.js';
import { registerApplicationCommands } from './services/command-registration.service.js';
import type { Command } from './types/command.js';

const logger = new Logger(environment.LOG_LEVEL);
const database = new DatabaseClient(environment.DATABASE_PATH);
const cases = new ModerationCaseRepository(database.connection);
const validator = new ModerationValidator();
const moderation = new ModerationService(cases, validator);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands: Command[] = [
  ...createModerationCommands(moderation, validator, cases),
  createPingCommand(client),
];

const commandMap = new Map(
  commands.map((command) => [command.data.name, command]),
);

registerInteractionHandler(client, commandMap, logger);

const handleReady = async (): Promise<void> => {
  if (!client.user) {
    throw new Error('Discord client became ready without a user.');
  }

  logger.info('Discord client connected.', {
    user: client.user.tag,
    guilds: client.guilds.cache.size,
  });

  try {
    await registerApplicationCommands(
      environment.DISCORD_CLIENT_ID,
      environment.DISCORD_TOKEN,
      commands,
    );

    logger.info('Application commands registered.');
  } catch (error: unknown) {
    logger.error('Application command registration failed.', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

client.once(Events.ClientReady, () => {
  handleReady().catch((error: unknown) => {
    logger.error('Ready handler failed.', {
      error: error instanceof Error ? error.message : String(error),
    });
  });
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info('Shutting down.', { signal });

  await client.destroy();
  database.close();
};

const handleShutdown = (signal: string): void => {
  shutdown(signal)
    .then(() => {
      process.exit(0);
    })
    .catch((error: unknown) => {
      logger.error('Shutdown failed.', {
        error: error instanceof Error ? error.message : String(error),
      });

      process.exit(1);
    });
};

process.once('SIGINT', () => {
  handleShutdown('SIGINT');
});

process.once('SIGTERM', () => {
  handleShutdown('SIGTERM');
});

const start = async (): Promise<void> => {
  try {
    await client.login(environment.DISCORD_TOKEN);
  } catch (error: unknown) {
    logger.error('Discord login failed.', {
      error: error instanceof Error ? error.message : String(error),
    });

    database.close();
    process.exitCode = 1;
  }
};

start().catch((error: unknown) => {
  logger.error('Unexpected startup failure.', {
    error: error instanceof Error ? error.message : String(error),
  });

  database.close();
  process.exitCode = 1;
});