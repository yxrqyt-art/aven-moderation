import type { Command } from '../../types/command.js';
import type { ModerationCaseRepository } from '../../repositories/moderation-case.repository.js';
import type { ModerationService } from '../../services/moderation.service.js';
import type { ModerationValidator } from '../../validators/moderation.validator.js';
import { createBanCommand } from './ban.js';
import { createClearWarningsCommand } from './clear-warnings.js';
import { createKickCommand } from './kick.js';
import { createPurgeCommand } from './purge.js';
import { createTimeoutCommand } from './timeout.js';
import { createUntimeoutCommand } from './untimeout.js';
import { createWarnCommand } from './warn.js';
import { createWarningsCommand } from './warnings.js';

export function createModerationCommands(
  service: ModerationService,
  validator: ModerationValidator,
  cases: ModerationCaseRepository,
): Command[] {
  return [
    createBanCommand(service, validator),
    createKickCommand(service, validator),
    createTimeoutCommand(service, validator),
    createUntimeoutCommand(service, validator),
    createWarnCommand(service, validator),
    createWarningsCommand(cases, validator),
    createClearWarningsCommand(cases, validator),
    createPurgeCommand(validator),
  ];
}
