import { GuildMember, type ChatInputCommandInteraction } from 'discord.js';
import { ApplicationError } from '../../../errors/application.error.js';

export function getMemberOption(
  interaction: ChatInputCommandInteraction<'cached'>,
  name = 'member',
): GuildMember {
  const member = interaction.options.getMember(name);

  if (!(member instanceof GuildMember)) {
    throw new ApplicationError(
      `Expected guild member option: ${name}.`,
      'The selected user is not available as a server member.',
    );
  }

  return member;
}
