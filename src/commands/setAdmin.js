import { myLogs } from "../libs/utils/myLogs.js";
import { getConfig, saveConfig } from "../helper/getConfig.js";

export const setAdmin = async (client, msg, args) => {
  const config = getConfig();

  myLogs(client, "loading", `${msg.author.username} used HF SETADMIN command`);

  let target = msg.mentions.users.first();

  if (!target && args) {
    const match = args.match(/^<@!?(\d+)>$|^(\d{17,19})$/);
    if (match) {
      const userId = match[1] || match[2];
      target = await client.users.fetch(userId).catch(() => null);
    }
  }

  if (!target) {
    myLogs(client, "error", `No target found for SETADMIN`);
    return msg.reply("😭 Mention or give the person id… b-bakaaa");
  }

  if (config.commands.admin.includes(target.id)) {
    myLogs(client, "alert", `${target.id} already admin`);
    return msg.reply(`😤 <@${target.id}> alr an admin baka…`);
  }

  config.commands.admin.push(target.id);
  saveConfig(config);

  myLogs(client, "success", `${target.id} set as admin`);

  return msg.reply(`🚀 <@${target.id}> now an admin~ congrats ✨😤`);
};