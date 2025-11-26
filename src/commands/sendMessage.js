import { myLogs } from "../libs/utils/myLogs.js";
import { getConfig } from "../helper/getConfig.js";

export const sendMsg = async (msg, client, args) => {
  const isOwner = process.env.OWNER_DISCORD_ID;

  // if (!msg.member.roles.cache.has(ownerRoleId)) {
  //   myLogs(
  //     client,
  //     "notAllowed",
  //     `${msg.author.username} tried but not allowed!`
  //   );
  //   return msg.reply("🚫 You are not allowed.");
  // }

  const config = getConfig();

  const isAdmin = config.commands.admin.includes(msg.author.id);
    if (!isOwner && !isAdmin) {
    myLogs(
      client,
      "notAllowed",
      `${msg.author.username} tried but not allowed!`
    );
    return msg.reply("🚫 You are not allowed.");
  }

  const [id, ...messageParts] = args.split(" ");
  let text = messageParts.join(" ");

  if (!id || !text) {
    return msg.reply("❌ Use: `$sendmsg {id} {message}`");
  }

  try {
    const channel = client.channels.cache.get(id);

    if (text.includes("@eve")) {
      text = text.replace("@eve", "@everyone");
    }

    if (channel) {
      await channel.send(text);
      myLogs(client, "success", `Message sent to channel ${id}`);
      return msg.reply(`📢 Message sent to channel <#${id}>`);
    }

    const user = await client.users.fetch(id);
    await user.send(text);

    msg.reply(`✅ DM sent to **${user.username}**`);
    myLogs(client, "success", `DM sent to ${user.username}`);
  } catch (err) {
    myLogs(client, "error", err);
    msg.reply("⚠️ Failed to send! ID invalid?");
  }
};
