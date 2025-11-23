export const fetchUser = async (client, msg, id) => {
    try {
        const user = await client.users.fetch(id);
        
        await msg.reply(`Fetched user: ${user.username} (ID: ${user.id})`);
    } catch (error) {
        console.error(`Failed to fetch user with ID ${id}:`, error);
        return null;
    }
}