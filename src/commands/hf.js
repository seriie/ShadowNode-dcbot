import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ownerRoleId = process.env.OWNER_ROLE_ID;
const ownerId = process.env.OWNER_DISCORD_ID;

export async function hf(msg, args) {
  const member = msg.member;
  if (!member) return;

  const hasOwnerRole = member.roles.cache.has(ownerRoleId);
  if (!hasOwnerRole && msg.author.id !== ownerId) {
    return msg.reply("❌ You are not allowed heh... b-baka 😤");
  }

  if (args.length < 1) {
    return msg.reply("⚙️ Give command: `open`, `close`, `ban`, `unban` 😭");
  }

  const arg = args.split(" ");
  const option = arg[0]?.toLowerCase();
  const targetArg = arg[1];

  const configPath = path.resolve(__dirname, "../config/bot.json");

  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));

    if (option === "open") {
      if (config.commands.hf.isOpen) {
        return msg.reply("🟢 Already OPEN... w-why open again b-baka 😤");
      }

      config.commands.hf.isOpen = true;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      return msg.reply("🟢 **HF OPEN** — everyone allowed 💅✨");
    }

    if (option === "close") {
      if (!config.commands.hf.isOpen) {
        return msg.reply(
          "🔒 Already CLOSED... don't close the door that alr closed b-baka 😭"
        );
      }

      config.commands.hf.isOpen = false;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      return msg.reply("🔒 **HF CLOSED** — owner only heh 😤🔥");
    }

    // ===== BAN =====
    if (option === "ban") {
      let target = msg.mentions.users.first();

      // kalo ga ada mention, coba parse dari args[1]
      if (!target && targetArg) {
        const match = targetArg.match(/^<@!?(\d+)>$/);
        if (match) target = msg.client.users.cache.get(match[1]);
      }

      // kalo masih ga ada, coba dari reply
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

      if (!target)
        return msg.reply("😭 Mention or reply the person to ban... b-bakaaa");

      if (config.commands.hf.bannedId.includes(target.id)) {
        return msg.reply(
          `😤 <@${target.id}> is **already banned**... why twice b-baka`
        );
      }

      config.commands.hf.bannedId.push(target.id);
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      return msg.reply(`🚫 <@${target.id}> banned from HF, bye~ 😤✋`);
    }

    // ===== UNBAN =====
    if (option === "unban") {
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

      if (!target)
        return msg.reply(
          "😭 Mention or reply to the person to unban... b-bakaaa"
        );

      config.commands.hf.bannedId = config.commands.hf.bannedId.map((id) =>
        id.trim()
      );

      if (!config.commands.hf.bannedId.includes(target.id)) {
        return msg.reply(
          `🤨 <@${target.id}> is **not banned**... what ru doing 😭`
        );
      }

      config.commands.hf.bannedId = config.commands.hf.bannedId.filter(
        (id) => id !== target.id
      );

      writeFileSync(configPath, JSON.stringify(config, null, 2));

      return msg.reply(`✅ <@${target.id}> unbanned... w-welcome back 😳`);
    }

    if (!option) {
      msg.reply("❓ choose `open`, `close`, `ban`, `unban` b-baka 😭");
    }
  } catch (e) {
    console.log(e);
    msg.reply("❌ Error config... hiks 😢");
  }
}
