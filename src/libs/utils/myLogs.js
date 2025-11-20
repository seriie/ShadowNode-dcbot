export const myLogs = async (client, type, text) => {
    const now = new Date();
    const dateTime = now.toLocaleString();

    const emojis = {
        warn: "⚠️",
        success: "✅",
        loading: "🔄",
        error: "❌",
        notAllowed: "🚫",
        alert: "❗",
        cleaning: "🧹",
        trash: "🗑️"
    };

    const emoji = emojis[type] || "";
    const formattedText = `${dateTime} | ${emoji} ${text}`;

    const logChannel = client.channels.cache.get(process.env.LOGS_CHANNEL_ID);
    if (!logChannel) return console.log("Log channel not found!");

    logChannel.send(formattedText);
    return formattedText;
};
