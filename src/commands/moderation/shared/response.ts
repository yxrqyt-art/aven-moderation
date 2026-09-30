import { EmbedBuilder, type GuildMember } from 'discord.js';

export function createCaseEmbed(
  caseId: number,
  action: string,
  target: GuildMember,
  reason: string,
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(`Moderation case #${caseId}`)
    .addFields(
      { name: 'Action', value: action, inline: true },
      { name: 'Target', value: `${target.user.tag} (${target.id})`, inline: true },
      { name: 'Reason', value: reason },
    )
    .setTimestamp();
}
