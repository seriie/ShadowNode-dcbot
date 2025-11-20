import { myLogs } from "../libs/utils/myLogs.js";

export const sendMsg = async (msg, client, args) => {
  const ownerId = process.env.OWNER_DISCORD_ID;
  
  if (!msg.author.id === ownerId) {
    myLogs(client, "notAllowed", `${msg.author.displayName} trying to send dms but not allowed!`);
    await msg.reply("🚫 You are not allowed.");
    return;
  }

  myLogs(client, "loading", `${msg.author.displayName} trying to send dms`);
  const [id, ...messageParts] = args.split(" ");
  const text = messageParts.join(" ");

  if (!id || !text) {
    return msg.reply("❌ Invalid format! Use: `$sendmsg {id} {message}`");
  }

  try {
    const user = await client.users.fetch(id);
    await user.send(text);
    msg.reply(`✅ Message sent to **${user.displayName}**`);
    myLogs(client, "success", `Message sent to **${user.displayName}**`);
  } catch (err) {
    myLogs(client, "error", err);
    msg.reply("⚠️ Failed to send DM! recheck the ID!");
  }
};