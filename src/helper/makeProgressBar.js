export const makeProgressBar = (value, maxValue, multiple = 1) => {
  const percent = (value / maxValue) * 100;
  const totalBars = 20;

  const filledBars = (percent / 100) * totalBars;
  const emptyBars = totalBars - filledBars;

  return `【${"█".repeat(filledBars)}${"░".repeat(emptyBars)}】 ${value.toFixed(2) * multiple}%`;
};
