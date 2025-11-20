import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import { myLogs } from "./libs/utils/myLogs.js";

dotenv.config();

import { verification, handleRegisterButton, handleRegionSelect } from "./messages/verification.js";

// Commands
import { halo } from "./commands/halo.js";
import { sendMsg } from "./commands/sendMessage.js";
import { hf } from "./commands/hugging-face/hf.js";
import { hfttm } from "./commands/hugging-face/hfttm.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("clientReady", async () => {
  console.log(`✅  Logged in as ${client.user.tag}`);
  myLogs(client, "success", `Logged in as ${client.user.tag}`);

  // Verification
  await verification(client);
});

client.on("messageCreate", async (msg) => {
  const channel = msg.channel;

  if (msg.content.startsWith("$")) {
    const command = msg.content.slice(1).split(" ")[0];
    const args = msg.content.slice(command.length + 1).trim();

    try {
      switch (command) {
        case "halo":
          halo(client, msg);
          break;
        case "sendmsg":
          sendMsg(msg, client, args);
          break;
        case "hf":
          hf(msg, args);
          break;
        case "hfttm":
          hfttm(msg, args);
          break;
        default:
          msg.reply(`Couldn't find **${command}** command.`);
      }
    } catch (e) {}
  }
});

client.on("interactionCreate", async (interaction) => {
  // Verification
  await handleRegisterButton(client, interaction);
  await handleRegionSelect(client, interaction);
});

client.login(process.env.TOKEN);
