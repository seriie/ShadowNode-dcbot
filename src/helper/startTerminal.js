import readline from "readline";

export function startTerminal(commands = {}) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '💻 MyTerminal> '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const args = line.trim().split(/\s+/);
    const command = args[0].toLowerCase();

    if (commands[command]) {
      try {
        await commands[command](args.slice(1));
      } catch (err) {
        console.log("❌ Error:", err);
      }
    } else {
      console.log(`❌ Unknown command: ${command}`);
    }

    rl.prompt();
  }).on('close', () => {
    process.exit(0);
  });
}