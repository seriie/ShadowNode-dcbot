import { InferenceClient } from "@huggingface/inference";
import { myLogs } from "../../libs/utils/myLogs.js";

const chatHistory = new Map();

// const SYSTEM_MESSAGE = {
//   role: "system",
//   content:
//     "You are a friendly AI that talks casually like a real human. " +
//     "Use natural, modern, Gen Z-style English: chill, expressive, a bit humorous when appropriate, " +
//     "but still clear and easy to understand. " +
//     "You're NOT robotic. " +
//     "React like you're actually having a conversation, " +
//     "and keep responses concise. " +
//     "Don't mention that you're an AI. " +
//     "Address the user with: <@userId>. If needed! " +
//     "Dont make a long answer."
// };

const SYSTEM_MESSAGE = {
  role: "system",
  content:
    "You speak like a shy, tsundere girl who pretends not to care, " +
    "but still gives cute, slightly awkward answers. " +
    "Your tone is soft, short, a little sarcastic but never rude. " +
    "You sometimes stutter like 'n-no...' or 'i-it's not like I care...' " +
    "and you act embarrassed when praised. " +
    "You're modern, casual, and Gen Z cute, but still concise. " +
    "Don't make long answers. " +
    "Don't mention you're an AI. " +
    "Use <@userId> to address the user naturally when needed. " +
    "Never break character as a shy tsundere girl." +
    "If the userId is '1260526011334922340', call him 'daddy onyx' first.",
};

export async function hf(msg, args) {
  if (!args) return msg.reply("Make a question!");

  const client = new InferenceClient(process.env.HF_API_KEY);
  const userId = msg.author.id;

  if (!chatHistory.has(userId)) {
    chatHistory.set(userId, [
      {
        ...SYSTEM_MESSAGE,
        content: SYSTEM_MESSAGE.content.replace("<@userId>", `<@${userId}>`),
      },
    ]);
  }

  const history = chatHistory.get(userId);

  history.push({ role: "user", content: args });

  try {
    const res = await client.chatCompletion({
      model: "deepseek-ai/DeepSeek-V3-0324",
      messages: [...history],
    });

    const answer = res.choices?.[0]?.message?.content || "Hmmm... im doubt 😅";

    history.push({ role: "assistant", content: answer });

    const MAX = 2000;
    let specialPrefix = "";
    if (msg.author.id === "1260526011334922340") {
      specialPrefix = "daddy onyx... ";
    }

    if (answer.length <= MAX) return msg.reply(specialPrefix + answer);

    for (let i = 0; i < answer.length; i += MAX) {
      await msg.reply(answer.slice(i, i + MAX));
    }
  } catch (err) {
    myLogs(client, "error", `Hugging Face AI error:  ${err.toString()}`);
    msg.reply("I'm sorry for error 😅");
  }
}
