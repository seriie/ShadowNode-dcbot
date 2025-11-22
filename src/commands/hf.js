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
    return msg.reply("❌ You don't have perms to do this 😤");
  }

  if (args.length < 2) {
    return msg.reply("⚙️  give option? `open` or `close` 😭");
  }

  const option = args.toLowerCase();
  const configPath = path.resolve(__dirname, "../config/bot.json");
  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));

    if (option === "open") {
      config.commands.hf.isOpen = true;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      return msg.reply("🟢 **HF feature OPEN** — All user allowed 💅✨");
    }

    if (option === "close") {
      config.commands.hf.isOpen = false;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      return msg.reply("🔒 **HF feature CLOSED** — Owner only 😤🔥");
    }

    msg.reply("❓ Choose `open` or `close` b-baka 😭");
  } catch (e) {
    console.log(e);
    msg.reply("❌ Failed to update config 😢");
  }
}
