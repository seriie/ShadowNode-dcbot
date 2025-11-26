import { myLogs } from "../libs/utils/myLogs.js";
import { getConfig, saveConfig } from "../helper/getConfig.js";

export const removeAdmin = async (client, msg) => {
    const config = getConfig();

  myLogs(
    client,
    "loading",
    `${msg.author.displayName} used HF REMOVEADMIN command`
  );
  let target;
  if (msg.mentions.users.first()) {
    target = msg.mentions.users.first();
  } else if (msg.reference) {
    try {
      const refMsg = await msg.channel.messages.fetch(msg.reference.messageId);
      target = refMsg.author;
    } catch (err) {
      console.log("Failed to fetch referenced message:", err);
    }
  }

  if (!target) {
    myLogs(client, "error", `No target found for REMOVEADMIN command`);
    return msg.reply(
      "😭 Mention or reply to the person to remove admin... b-bakaaa"
    );
  }
  config.commands.admin = config.commands.admin.map((id) => id.trim());
  if (!config.commands.admin.includes(target.id)) {
    myLogs(client, "alert", `<@${target.id}> is not HF admin`);
    return msg.reply(`🤨 <@${target.id}> is **not admin**... what ru doing 😭`);
  }
  config.commands.admin = config.commands.admin.filter(
    (id) => id !== target.id
  );
  saveConfig(config);
  myLogs(client, "success", `<@${target.id}> removed from HF admin`);
  return msg.reply(`✅ <@${target.id}> removed from admin... cyaa 😳`);
};
