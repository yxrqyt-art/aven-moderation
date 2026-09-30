import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ModerationCaseRepository } from '../src/repositories/moderation-case.repository.js';

let database: Database.Database;
let repository: ModerationCaseRepository;

beforeEach(() => {
  database = new Database(':memory:');
  database.exec(`
    CREATE TABLE moderation_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT
    );
  `);
  repository = new ModerationCaseRepository(database);
});

afterEach(() => database.close());

describe('ModerationCaseRepository', () => {
  it('creates and retrieves warnings for the requested member only', () => {
    const created = repository.create({
      guildId: 'guild-1', targetId: 'member-1', moderatorId: 'mod-1',
      action: 'WARN', reason: 'Spam', createdAt: '2026-09-30T12:00:00.000Z', expiresAt: null,
    });
    repository.create({
      guildId: 'guild-1', targetId: 'member-2', moderatorId: 'mod-1',
      action: 'WARN', reason: 'Other member', createdAt: '2026-09-30T12:01:00.000Z', expiresAt: null,
    });
    expect(repository.findWarnings('guild-1', 'member-1')).toEqual([created]);
  });

  it('clears warnings without deleting other moderation cases', () => {
    repository.create({ guildId: 'guild-1', targetId: 'member-1', moderatorId: 'mod-1', action: 'WARN', reason: 'Spam', createdAt: '2026-09-30T12:00:00.000Z', expiresAt: null });
    repository.create({ guildId: 'guild-1', targetId: 'member-1', moderatorId: 'mod-1', action: 'KICK', reason: 'Escalation', createdAt: '2026-09-30T12:05:00.000Z', expiresAt: null });
    expect(repository.clearWarnings('guild-1', 'member-1')).toBe(1);
    expect(repository.findWarnings('guild-1', 'member-1')).toEqual([]);
    const remaining = database.prepare('SELECT action FROM moderation_cases').all() as Array<{ action: string }>;
    expect(remaining).toEqual([{ action: 'KICK' }]);
  });
});
