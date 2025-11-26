import { makeProgressBar } from "./makeProgressBar.js";

export function playerEvalMessage({
  count,
  player,
  reasoning,
  improvement,
  note,
  ovr,
  rank,
  ranker,
  evalId,
  offense,
  defense,
  playmaking,
  style_mastery,
  vision,
}) {
  let textMsg = `# TRYOUT RESULT ${count} #\n\n`;

  textMsg += `## Player: **<@${player}>** ##\n\n`;
  textMsg += `🏀 **Skills:**\n`;
  textMsg += `> -# **Offense:** ${makeProgressBar(offense, 10)} (${offense})\n`;
  textMsg += `> -# **Defense:** ${makeProgressBar(defense, 10)} (${defense})\n`;
  textMsg += `> -# **Playmaking:** ${makeProgressBar(playmaking, 10)} (${playmaking})\n`;
  textMsg += `> -# **Style Mastery:** ${makeProgressBar(style_mastery, 10)} (${style_mastery})\n`;
  textMsg += `> -# **Vision:** ${makeProgressBar(vision, 10)} (${vision})\n\n`;
  textMsg += `**OVR:** ${makeProgressBar(ovr, 100)}\n`;
  textMsg += `**Rank:** ${rank}\n\n`;

  textMsg += `**Reason:** ${reasoning}\n\n`;
  textMsg += `**Improve:** ${improvement}\n\n`;
  textMsg += `**Note:** ${note}\n\n`;
  textMsg += `**Evaluator:** <@${ranker}>\n`;
  textMsg += `-# Eval ID: \`${evalId}\`\n`;

  return textMsg;
}
