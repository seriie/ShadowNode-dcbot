import { InferenceClient } from "@huggingface/inference";
import { chatHistory, createSystemMessage } from "./huggingFace.js";

const TRIGGERS = [
  { word: "zee", prompt: "Someone mentioned Zee. Act jealous and clingy." },
  { word: "sajuna", prompt: "Someone called your name. Act shy and flustered." },
  { word: "inui", prompt: "Someone called your name. Act shy and flustered." }
];

export function registerTriggerListener(client) {
  client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    const content = msg.content.toLowerCase();
    const found = TRIGGERS.find(t => content.includes(t.word));
    if (!found) return;

    if (msg.mentions.has(client.user.id)) return;

    const hfClient = new InferenceClient(process.env.HF_API_KEY);
    const userId = msg.author.id;

    if (!chatHistory.has(userId)) {
      chatHistory.set(userId, [createSystemMessage(userId)]);
    }

    const history = chatHistory.get(userId);

    history.push({
      role: "user",
      content: found.prompt
    });

    try {
      const res = await hfClient.chatCompletion({
        model: "deepseek-ai/DeepSeek-V3-0324",
        messages: [...history]
      });

      const answer =
        res.choices?.[0]?.message?.content ||
        "u-um… i-it’s confusing… 😖✨";

      history.push({ role: "assistant", content: answer });
      msg.reply(answer);

    } catch (err) {
      console.log("HF trigger error:", err);
    }
  });
}