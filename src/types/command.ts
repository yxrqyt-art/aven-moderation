import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export interface CommandContext {
  readonly interaction: ChatInputCommandInteraction;
}

export interface Command {
  readonly data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute(context: CommandContext): Promise<void>;
}
