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
  textMsg += `> -# **Offense:** (${offense}) ${makeProgressBar(offense, 10)}\n`;
  textMsg += `> -# **Defense:** (${defense}) ${makeProgressBar(defense, 10)}\n`;
  textMsg += `> -# **Playmaking:** (${playmaking}) ${makeProgressBar(playmaking, 10)}\n`;
  textMsg += `> -# **Style Mastery:** (${style_mastery}) ${makeProgressBar(style_mastery, 10)}\n`;
  textMsg += `> -# **Vision:** (${vision}) ${makeProgressBar(vision, 10)}\n\n`;
  textMsg += `**OVR:** ${makeProgressBar(ovr, 100)}\n`;
  textMsg += `**Rank:** ${rank}\n\n`;

  textMsg += `**Reason:** ${reasoning}\n\n`;
  textMsg += `**Improve:** ${improvement}\n\n`;
  textMsg += `**Note:** ${note}\n\n`;
  textMsg += `**Evaluator:** <@${ranker}>\n`;
  textMsg += `-# Eval ID: \`${evalId}\`\n`;

  return textMsg;
}
