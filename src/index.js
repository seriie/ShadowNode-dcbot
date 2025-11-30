import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import { myLogs } from "./libs/utils/myLogs.js";

dotenv.config();

// Messages
import {
  verification,
  handleRegisterButton,
  handleRegionSelect,
} from "./messages/verification.js";
import {
  evaluation,
  handleEvaluateButton,
  handleSelectRegion,
  handlePagination,
  handleSelectPlayer,
  handleModalSubmit,
  handleOpenStep2,
  delEval,
  handleDeleteEvalModal
} from "./messages/evaluation.js";

// Ai features
import { huggingFace } from "./features/hugging-face/hf.js";

// Commands
import { halo } from "./commands/halo.js";
import { sendMsg } from "./commands/sendMessage.js";
import { hfttm } from "./commands/hfttm.js";
import { hf } from "./commands/hf.js";
import { fetchUser } from "./commands/fetchUser.js";
import { setAdmin } from "./commands/setAdmin.js";
import { removeAdmin } from "./commands/removeAdmin.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.once("clientReady", async () => {
  console.log(`✅  Logged in as ${client.user.tag}`);
  myLogs(client, "success", `Logged in as ${client.user.tag}`);

  // messages
  await verification(client);
  await evaluation(client);
});

client.on("messageCreate", async (msg) => {
  huggingFace(client, msg);

  const botCommandChannelId = process.env.BOT_COMMAND_CHANNEL_ID;
  const botCommandChannel = await client.channels.fetch(botCommandChannelId);

  if (!botCommandChannel) return console.log("⚠️ Log channel not found!");

  if (msg.channel.isDMBased()) {
    if (msg.author.bot) return;
    
    botCommandChannel.send(
      `📩 **DM from ${msg.author.tag} (${msg.author.id})**:\n${msg.content}`
    );

    console.log(`DM fom ${msg.author.tag} (${msg.author.id}): ${msg.content}`);
  }

  if (msg.content.startsWith("$")) {
    const command = msg.content.slice(1).split(" ")[0];
    const args = msg.content.slice(command.length + 1).trim();

    try {
      switch (command) {
        case "setadmin":
          await setAdmin(client, msg);
          break;
        case "remadmin":
          await removeAdmin(client, msg);
          break;
        case "halo":
          halo(client, msg);
          break;
        case "sendmsg":
          sendMsg(msg, client, args);
          break;
        case "hf":
          await hf(client, msg, args);
          break;
        case "hfttm":
          hfttm(msg, args);
          break;
        case "fetchuser":
          await fetchUser(client, msg, args);
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

  // Evaluation
  await handleSelectRegion(interaction)
  await handleSelectPlayer(client, interaction);
  await handleModalSubmit(client, interaction);
  await handleEvaluateButton(client, interaction);
  await handlePagination(client, interaction);
  await handleOpenStep2(interaction);
  await delEval(client, interaction);
  await handleDeleteEvalModal(client, interaction);
});

client.login(process.env.TOKEN);
