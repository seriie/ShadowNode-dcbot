import { readFileSync, writeFileSync } from "fs";
import { myLogs } from "../libs/utils/myLogs.js";
import { getConfig, saveConfig } from "../helper/getConfig.js";

const config = getConfig();

const ownerId = process.env.OWNER_DISCORD_ID;

const optionsList = [
  {
    command: "open",
    description: "Open HF command to everyone",
  },
  {
    command: "close",
    description: "Close HF command to owner only",
  },
  {
    command: "ban <@user>",
    description: "Ban user from using HF command",
  },
  {
    command: "unban <@user>",
    description: "Unban user to allow using HF command",
  },
  {
    command: "setadmin <@user>",
    description: "Set user as HF command admin",
  },
  {
    command: "removeadmin <@user>",
    description: "Remove user from HF command admin",
  },
];

export async function hf(client, msg, args) {
  const member = msg.member;
  const isOwner = msg.author.id === ownerId;
  const isAdmin = config.commands.admin.includes(msg.author.id);

  if (!member) return;

  const optsList = optionsList
    .map((o) => `\`${o.command}\` - ${o.description}`)
    .join("\n");

  if (!isOwner && !isAdmin) {
    return msg.reply("❌ You are not allowed heh... b-baka 😤");
  }

  if (args.length < 1) {
    return msg.reply(`⚙️ **Give command:**\n${optsList} 😭`);
  }

  const arg = args.split(" ");
  const option = arg[0]?.toLowerCase();
  const targetArg = arg[1];

  try {
    if (option === "open") {
      myLogs(
        client,
        "loading",
        `${msg.author.displayName} used HF OPEN command`
      );

      if (config.commands.hf.isOpen) {
        myLogs(client, "alert", `HF command was already OPEN`);
        return msg.reply("🟢 Already OPEN... w-why open again b-baka 😤");
      }

      config.commands.hf.isOpen = true;
      saveConfig(config);
      myLogs(client, "alert", `HF command is now OPEN`);
      return msg.reply("🟢 **HF OPEN** — everyone allowed 💅✨");
    }

    if (option === "close") {
      myLogs(
        client,
        "loading",
        `${msg.author.displayName} used HF CLOSE command`
      );
      if (!config.commands.hf.isOpen) {
        myLogs(client, "alert", `HF command was already CLOSED`);
        return msg.reply(
          "🔒 Already CLOSED... don't close the door that alr closed b-baka 😭"
        );
      }

      config.commands.hf.isOpen = false;
      saveConfig(config);
      myLogs(client, "success", `HF command is now CLOSED`);
      return msg.reply("🔒 **HF CLOSED** — owner only heh 😤🔥");
    }

    // ===== BAN =====
    if (option === "ban") {
      myLogs(
        client,
        "loading",
        `${msg.author.displayName} used HF BAN command`
      );
      let target = msg.mentions.users.first();

      if (!target && targetArg) {
        const match = targetArg.match(/^<@!?(\d+)>$/);
        if (match) target = msg.client.users.cache.get(match[1]);
      }

      if (!target && msg.reference) {
        try {
          const refMsg = await msg.channel.messages.fetch(
            msg.reference.messageId
          );
          target = refMsg.author;
        } catch (err) {
          console.log("Failed to fetch referenced message:", err);
        }
      }

      if (!target) {
        myLogs(client, "error", `No target found for BAN command`);
        return msg.reply("😭 Mention or reply the person to ban... b-bakaaa");
      }

      if (target.id === ownerId) {
        myLogs(
          client,
          "alert",
          `<@${msg.author.id}> can't ban <@${target.id}> cs he's owner`
        );
        return msg.reply(`:rage: You can't ban <@${target.id}> cs he's owner!`);
      }

      if (config.commands.hf.bannedId.includes(target.id)) {
        myLogs(client, "alert", `<@${target.id}> is already banned from HF`);
        return msg.reply(
          `😤 <@${target.id}> is **already banned**... why twice b-baka`
        );
      }

      config.commands.hf.bannedId.push(target.id);
      saveConfig(config);
      myLogs(client, "success", `<@${target.id}> banned from HF`);
      return msg.reply(`🚫 <@${target.id}> banned from HF, bye~ 😤✋`);
    }

    // ===== UNBAN =====
    if (option === "unban") {
      myLogs(
        client,
        "loading",
        `${msg.author.displayName} used HF UNBAN command`
      );
      let target;

      if (msg.mentions.users.first()) {
        target = msg.mentions.users.first();
      } else if (msg.reference) {
        try {
          const refMsg = await msg.channel.messages.fetch(
            msg.reference.messageId
          );
          target = refMsg.author;
        } catch (err) {
          console.log("Failed to fetch referenced message:", err);
        }
      }

      if (!target) {
        myLogs(client, "error", `No target found for UNBAN command`);
        return msg.reply(
          "😭 Mention or reply to the person to unban... b-bakaaa"
        );
      }

      config.commands.hf.bannedId = config.commands.hf.bannedId.map((id) =>
        id.trim()
      );

      if (!config.commands.hf.bannedId.includes(target.id)) {
        myLogs(client, "alert", `<@${target.id}> is not banned from HF`);
        return msg.reply(
          `🤨 <@${target.id}> is **not banned**... what ru doing 😭`
        );
      }

      config.commands.hf.bannedId = config.commands.hf.bannedId.filter(
        (id) => id !== target.id
      );

      saveConfig(config);
      myLogs(client, "success", `<@${target.id}> unbanned from HF`);
      return msg.reply(`✅ <@${target.id}> unbanned... w-welcome back 😳`);
    }

    if (option !== optionsList.map((o) => o.command).includes(option)) {
      myLogs(client, "error", `No valid option provided for HF command`);
      return msg.reply(`❓ **choose:**\n${optsList}`);
    }
  } catch (e) {
    console.log(e);
    myLogs(client, "error", `Error handling HF command: ${e.message}`);
    msg.reply("❌ Error config... hiks 😢");
  }
}
