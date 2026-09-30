import { REST, Routes } from 'discord.js';
import type { Command } from '../types/command.js';

export async function registerApplicationCommands(
  clientId: string,
  token: string,
  commands: readonly Command[],
): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationCommands(clientId), {
    body: commands.map((command) => command.data.toJSON()),
  });
}
