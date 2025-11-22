export const fetchUser = async (client, id) => {
  if (!id) {
    console.log("⚠️ fetchUser called with null ID");
    return null;
  }

  try {
    const user = await client.users.fetch(id);
    return user;
  } catch (e) {
    console.log("⚠️ Failed to fetch user:", id);
    return null;
  }
};