import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ownerRoleId = process.env.OWNER_ROLE_ID;
const ownerId = process.env.OWNER_DISCORD_ID;

export function hf(msg, args) {
  const member = msg.member;
  if (!member) return;

  const hasOwnerRole = member.roles.cache.has(ownerRoleId);
  if (!hasOwnerRole && msg.author.id !== ownerId) {
    return msg.reply("❌ You are not allowed heh... b-baka 😤");
  }

  if (args.length < 2) {
    return msg.reply("⚙️ Give command: `open`, `close`, `ban`, `unban` 😭");
  }

  const option = args[1].toLowerCase();
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
      const target =
        msg.mentions.users.first() ||
        (msg.reference &&
          msg.channel.messages.cache.get(msg.reference.messageId)?.author);

      if (!target) return msg.reply("😭 Mention the person to ban... b-bakaaa");

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
      const target =
        msg.mentions.users.first() ||
        (msg.reference &&
          msg.channel.messages.cache.get(msg.reference.messageId)?.author);

      if (!target)
        return msg.reply("😭 Mention the person to unban... b-bakaaa");

      // CEK KALO DIA EMANG GA KE BAN
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
