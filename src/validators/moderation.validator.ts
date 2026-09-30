import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type GuildMember,
} from 'discord.js';
import { ApplicationError } from '../errors/application.error.js';

export class ModerationValidator {
  public requireGuild(interaction: ChatInputCommandInteraction): asserts interaction is ChatInputCommandInteraction<'cached'> {
    if (!interaction.inCachedGuild()) {
      throw new ApplicationError(
        'Moderation command used outside a cached guild.',
        'This command can only be used in a server.',
      );
    }
  }

  public requireActorPermission(
    interaction: ChatInputCommandInteraction<'cached'>,
    requiredPermission: bigint,
  ): void {
    if (!interaction.member.permissions.has(requiredPermission)) {
      throw new ApplicationError(
        'Actor lacks permission.',
        'You do not have permission to perform this action.',
      );
    }
  }

  public validateTarget(
    interaction: ChatInputCommandInteraction<'cached'>,
    target: GuildMember,
    requiredPermission: bigint,
  ): void {
    const actor = interaction.member;
    const bot = interaction.guild.members.me;

    this.requireActorPermission(interaction, requiredPermission);

    if (!bot?.permissions.has(requiredPermission)) {
      throw new ApplicationError('Bot lacks permission.', 'I do not have the required server permission.');
    }

    if (target.id === actor.id) {
      throw new ApplicationError('Self moderation attempt.', 'You cannot perform this action on yourself.');
    }

    if (target.id === interaction.guild.ownerId) {
      throw new ApplicationError('Owner moderation attempt.', 'The server owner cannot be targeted.');
    }

    if (actor.id !== interaction.guild.ownerId &&
        actor.roles.highest.comparePositionTo(target.roles.highest) <= 0) {
      throw new ApplicationError('Actor hierarchy violation.', 'Your highest role must be above the target member.');
    }

    if (!bot || bot.roles.highest.comparePositionTo(target.roles.highest) <= 0) {
      throw new ApplicationError('Bot hierarchy violation.', 'My highest role must be above the target member.');
    }
  }

  public validatePurgePermission(interaction: ChatInputCommandInteraction<'cached'>): void {
    this.requireActorPermission(interaction, PermissionFlagsBits.ManageMessages);

    if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      throw new ApplicationError(
        'Bot lacks ManageMessages.',
        'I do not have permission to manage messages.',
      );
    }
  }
}
