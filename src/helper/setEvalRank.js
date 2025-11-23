export const setEvalRank = (ovr, maxOvr = 10) => {
  const totalTiers = 7;
  const step = maxOvr / totalTiers;

  let tier = Math.ceil((maxOvr - ovr) / step) + 1;

  if (tier < 1) tier = 1;
  if (tier > 7) tier = 7;

  return `Tier ${tier}`;
};
