export const fetchUser = async (client, msg, id) => {
  if (!id) {
    console.log("⚠️ fetchUser called with null ID");
    return null;
  }

  try {
    const user = await client.getUserById(id);
    await msg.reply(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};