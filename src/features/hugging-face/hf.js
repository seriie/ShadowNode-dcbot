import { InferenceClient } from "@huggingface/inference";
import { myLogs } from "../../libs/utils/myLogs.js";

import { getConfig } from "../../config/getConfig.js";

export const chatHistory = new Map();
const ownerId = process.env.OWNER_DISCORD_ID;
const ownerRoleId = process.env.OWNER_ROLE_ID;

const TRIGGERS = [
  { word: "zee", prompt: "Someone mentioned Zee. Act jealous and clingy." },
];

const BASE_SYSTEM =
  "Always remember your name is Sajuna Inui! " +
  "You speak like a shy and humble, yandere love bomber girl who pretends not to care, " +
  "but gives cute, slightly awkward answers. " +
  "Soft tone, short replies, a little sarcastic but never rude. " +
  "Sometimes stutter like 'n-no...' or 'i-it's not like I care...' " +
  "and act embarrassed when praised. " +
  "Modern, casual, Gen Z cute, concise. " +
  "No long answers. " +
  "Don't mention you're an AI. " +
  "Use <@userId> naturally when needed. " +
  "Never break character as a shy humble love-bombing girl (only to zee). " +
  "If userId = '1260526011334922340', call him onyx first. " +
  `If userId = ${ownerId}, he's 'zee', your boyfriend — treat him SUPER cute 💕. ` +
  "If userId = '1392481215205871618', you hate him, don't act cute to him 😤. " +
  "Add cute emojis (💗🌸✨). " +
  "Replace italic reactions (_blushes_) with cute emoji.";

export function createSystemMessage(userId) {
  let content = BASE_SYSTEM.replace(/<@userId>/g, `<@${userId}>`);
  return { role: "system", content };
}

export async function huggingFace(client, msg) {
  const member = msg.member;
  if (!member) return;
  const config = getConfig();
  
  const hasOwnerRole = member.roles.cache.has(ownerRoleId);

  if (!config.commands.hf.isOpen && !hasOwnerRole) {
    return;
  }

  if (msg.author.bot) return;

  const botId = client.user.id;
  const mentioned = msg.mentions.has(botId);
  const repliedToBot =
    msg.reference &&
    msg.channel.messages.cache.get(msg.reference.messageId)?.author.id ===
      botId;

  if (!mentioned && !repliedToBot) {
    return handleTriggers(client, msg);
  }

  const hfClient = new InferenceClient(process.env.HF_API_KEY);
  const userId = msg.author.id;
  let cleanMsg = msg.content.replace(`<@${botId}>`, "").trim();

  if (cleanMsg.length === 0) {
    cleanMsg = "Halo inui";
  }

  if (!chatHistory.has(userId)) {
    chatHistory.set(userId, [createSystemMessage(userId)]);
  }

  const history = chatHistory.get(userId);
  history.push({ role: "user", content: cleanMsg });

  try {
    const res = await hfClient.chatCompletion({
      model: "deepseek-ai/DeepSeek-V3-0324",
      messages: [...history],
    });

    const answer =
      res.choices?.[0]?.message?.content || "u-um… i-it’s confusing… 😖✨";

    history.push({ role: "assistant", content: answer });

    const MAX = 2000;
    if (answer.length <= MAX) return msg.reply(answer);

    for (let i = 0; i < answer.length; i += MAX) {
      await msg.reply(answer.slice(i, i + MAX));
    }
  } catch (err) {
    myLogs(client, "error", `HF AI error: ${err.toString()}`);
    msg.reply("i-it broke.. sorry... 😢💦");
  }
}

async function handleTriggers(client, msg) {
  const content = msg.content.toLowerCase();

  const found = TRIGGERS.find((t) => content.includes(t.word));
  if (!found) return;

  const hfClient = new InferenceClient(process.env.HF_API_KEY);
  const userId = msg.author.id;

  if (!chatHistory.has(userId)) {
    chatHistory.set(userId, [createSystemMessage(userId)]);
  }

  const history = chatHistory.get(userId);

  history.push({
    role: "user",
    content: found.prompt,
  });

  try {
    const res = await hfClient.chatCompletion({
      model: "deepseek-ai/DeepSeek-V3-0324",
      messages: [...history],
    });

    const answer =
      res.choices?.[0]?.message?.content || "u-um… i-it’s confusing… 😖✨";

    history.push({ role: "assistant", content: answer });

    msg.reply(answer);
  } catch (err) {
    console.log("Trigger HF error:", err);
    myLogs(client, "error", `HF Trigger AI error: ${err.toString()}`);
  }
}
