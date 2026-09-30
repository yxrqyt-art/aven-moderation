import type Database from 'better-sqlite3';

export type ModerationAction = 'BAN' | 'KICK' | 'TIMEOUT' | 'UNTIMEOUT' | 'WARN';

export interface ModerationCase {
  readonly id: number;
  readonly guildId: string;
  readonly targetId: string;
  readonly moderatorId: string;
  readonly action: ModerationAction;
  readonly reason: string;
  readonly createdAt: string;
  readonly expiresAt: string | null;
}

interface CaseRow {
  id: number;
  guild_id: string;
  target_id: string;
  moderator_id: string;
  action: ModerationAction;
  reason: string;
  created_at: string;
  expires_at: string | null;
}

export class ModerationCaseRepository {
  public constructor(private readonly database: Database.Database) {}

  public create(input: Omit<ModerationCase, 'id'>): ModerationCase {
    const result = this.database.prepare(`
      INSERT INTO moderation_cases (
        guild_id, target_id, moderator_id, action, reason, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.guildId,
      input.targetId,
      input.moderatorId,
      input.action,
      input.reason,
      input.createdAt,
      input.expiresAt,
    );

    return { id: Number(result.lastInsertRowid), ...input };
  }

  public findWarnings(guildId: string, targetId: string): ModerationCase[] {
    const rows = this.database.prepare(`
      SELECT * FROM moderation_cases
      WHERE guild_id = ? AND target_id = ? AND action = 'WARN'
      ORDER BY id DESC
    `).all(guildId, targetId) as CaseRow[];

    return rows.map(this.mapRow);
  }

  public clearWarnings(guildId: string, targetId: string): number {
    return this.database.prepare(`
      DELETE FROM moderation_cases
      WHERE guild_id = ? AND target_id = ? AND action = 'WARN'
    `).run(guildId, targetId).changes;
  }

  private readonly mapRow = (row: CaseRow): ModerationCase => ({
    id: row.id,
    guildId: row.guild_id,
    targetId: row.target_id,
    moderatorId: row.moderator_id,
    action: row.action,
    reason: row.reason,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  });
}
