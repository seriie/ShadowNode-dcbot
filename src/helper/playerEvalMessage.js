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
  region
}) {
  let textMsg = `# TRYOUT RESULT ${count} #\n\n`;
  const multiple = 10;

  textMsg += `## Player: **<@${player}>** (${region}) ##\n\n`;
  textMsg += `🏀 **Skills:**\n`;
  textMsg += `> -# **Offense:** (${offense}) ${makeProgressBar(offense, 10, multiple)}\n`;
  textMsg += `> -# **Defense:** (${defense}) ${makeProgressBar(defense, 10, multiple)}\n`;
  textMsg += `> -# **Playmaking:** (${playmaking}) ${makeProgressBar(playmaking, 10, multiple)}\n`;
  textMsg += `> -# **Style Mastery:** (${style_mastery}) ${makeProgressBar(style_mastery, 10, multiple)}\n`;
  textMsg += `> -# **Vision:** (${vision}) ${makeProgressBar(vision, 10, multiple)}\n\n`;
  textMsg += `**OVR:** ${makeProgressBar(ovr, 100)}\n`;
  textMsg += `**Rank:** ${rank}\n`;
  textMsg += "-# (This rank will be automatically given to players)\n\n"

  textMsg += `**Reason:** ${reasoning}\n\n`;
  textMsg += `**Improve:** ${improvement}\n\n`;
  textMsg += `**Note:** ${note}\n\n`;
  textMsg += `**Evaluator:** <@${ranker}>\n`;
  textMsg += `-# Eval ID: \`${evalId}\`\n`;

  return textMsg;
}
