export const makeProgressBar = (value, maxValue) => {
  const percent = (value / maxValue) * 100;
  const totalBars = 10;

  const filledBars = Math.floor((percent / 100) * totalBars);
  const emptyBars = totalBars - filledBars;

  return `${
    ":basketball: ".repeat(filledBars) + ":white_circle:".repeat(emptyBars)
  } ${percent.toFixed(1)}%`;
};