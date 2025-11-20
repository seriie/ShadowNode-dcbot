import { myLogs } from "../libs/utils/myLogs.js";

export const bulkDelete = async (client, channel) => {
  try {
    myLogs(client, "cleaning", `Purging ALL messages in ${channel}`);

    let deleted;
    do {
      const fetched = await channel.messages.fetch({ limit: 100 });
      if (fetched.size === 0) break;

      deleted = await channel.bulkDelete(fetched, true);
      myLogs(client, "trash", `Deleted ${deleted.size} messages in ${channel}`);

      await new Promise((r) => setTimeout(r, 1500));
    } while (deleted.size > 0);
  } catch (err) {
    myLogs(client, "error", `Failed to delete messages in ${channel}: ${err.message}`);
  }
};