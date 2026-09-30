import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type GuildMember,
} from 'discord.js';
import type {
  ModerationAction,
  ModerationCase,
  ModerationCaseRepository,
} from '../repositories/moderation-case.repository.js';
import type { ModerationValidator } from '../validators/moderation.validator.js';
import { ApplicationError } from '../errors/application.error.js';

interface ActionContext {
  interaction: ChatInputCommandInteraction<'cached'>;
  target: GuildMember;
  reason: string;
}

export class ModerationService {
  public constructor(
    private readonly cases: ModerationCaseRepository,
    private readonly validator: ModerationValidator,
  ) {}

  public async ban(context: ActionContext): Promise<ModerationCase> {
    this.validator.validateTarget(context.interaction, context.target, PermissionFlagsBits.BanMembers);

    if (!context.target.bannable) {
      throw new ApplicationError(
        'Target member is not bannable by the bot.',
        'I cannot ban this member. Check my role position and permissions.',
      );
    }

    await context.target.ban({ reason: context.reason });
    return this.record(context, 'BAN');
  }

  public async kick(context: ActionContext): Promise<ModerationCase> {
    this.validator.validateTarget(context.interaction, context.target, PermissionFlagsBits.KickMembers);

    if (!context.target.kickable) {
      throw new ApplicationError(
        'Target member is not kickable by the bot.',
        'I cannot kick this member. Check my role position and permissions.',
      );
    }

    await context.target.kick(context.reason);
    return this.record(context, 'KICK');
  }

  public async timeout(
    context: ActionContext,
    durationMs: number,
  ): Promise<ModerationCase> {
    this.validator.validateTarget(context.interaction, context.target, PermissionFlagsBits.ModerateMembers);

    if (!context.target.moderatable) {
      throw new ApplicationError(
        'Target member is not moderatable by the bot.',
        'I cannot moderate this member. Check my role position and permissions.',
      );
    }

    await context.target.timeout(durationMs, context.reason);
    return this.record(
      context,
      'TIMEOUT',
      new Date(Date.now() + durationMs).toISOString(),
    );
  }

  public async untimeout(context: ActionContext): Promise<ModerationCase> {
    this.validator.validateTarget(context.interaction, context.target, PermissionFlagsBits.ModerateMembers);

    if (!context.target.moderatable) {
      throw new ApplicationError(
        'Target member is not moderatable by the bot.',
        'I cannot moderate this member. Check my role position and permissions.',
      );
    }

    await context.target.timeout(null, context.reason);
    return this.record(context, 'UNTIMEOUT');
  }

  public warn(context: ActionContext): ModerationCase {
    this.validator.validateTarget(context.interaction, context.target, PermissionFlagsBits.ModerateMembers);
    return this.record(context, 'WARN');
  }

  private record(
    context: ActionContext,
    action: ModerationAction,
    expiresAt: string | null = null,
  ): ModerationCase {
    return this.cases.create({
      guildId: context.interaction.guildId,
      targetId: context.target.id,
      moderatorId: context.interaction.user.id,
      action,
      reason: context.reason,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
  }
}
