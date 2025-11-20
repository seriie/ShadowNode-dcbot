import { myLogs } from "../libs/utils/myLogs.js";

export const halo = async (client, msg) => {
  myLogs(client, "loading", `${msg.author.displayName} is greeting`);

  const greetingWords = [
    "Halo",
    "Hi",
    "Hello",
    "Ello",
    "Yo yo yo",
    "Hiii",
    "Yoooo",
  ];
  const greetingEmojis = [
    ":heart:",
    ":crown:",
    ":bouquet:",
    ":star:",
    ":sparkles:",
    ":dizzy:",
    ":smiling_face_with_3_hearts:",
    ":two_hearts:",
    ":heart_hands:",
  ];

  const wordIndex = Math.floor(Math.random() * greetingWords.length);
  const emojiIndex = Math.floor(Math.random() * greetingEmojis.length);

  msg.reply(
    `${greetingWords[wordIndex]} **${msg.author.displayName}** ${greetingEmojis[emojiIndex]}`
  );
};