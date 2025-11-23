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
  evalId
}) {
  let textMsg = `# TRYOUT RESULT ${count} #\n\n`;
  
  textMsg += `## Player: **<@${player}>** ##\n`;
  textMsg += `**Reason:** ${reasoning}\n\n`;
  textMsg += `**Improve:** ${improvement}\n\n`;
  textMsg += `**Note:** ${note}\n\n`;
  textMsg += `**OVR:** ${makeProgressBar(ovr, 10)}\n`;
  textMsg += `**Rank:** ${rank}\n`;
  textMsg += `**Evaluator:** <@${ranker}>\n`;
  textMsg += `-# Eval ID: **${evalId}**\n`;

  return textMsg;
}