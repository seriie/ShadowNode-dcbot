import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import { supabase } from "../config/supabase.js";
import { nanoIdFormat } from "../libs/utils/nanoId.js";
import { myLogs } from "../libs/utils/myLogs.js";
import { bulkDelete } from "../helper/bulkDelete.js";
import { embedBuilder } from "../helper/embedBuilder.js";
import { fetchUser } from "../helper/fetchUser.js";
import { getAllPlayers } from "../helper/getAllPlayers.js";

export const evaluation = async (client) => {
  const channelId = process.env.EVALUATION_CHANNEL_ID;
  const channel = await client.channels.fetch(channelId);

  if (!channel) {
    myLogs(client, "warn", "Evaluation channel not found!");
    return;
  }

  bulkDelete(client, channel);

  const embedData = embedBuilder(
    "#00ff00",
    "🧠 Player Evaluation",
    "Hello! We are conducting an evaluation of our player performance.",
    null,
    "Do strict!",
    true
  );

  const evalButton = new ButtonBuilder()
    .setCustomId("evaluate_player")
    .setLabel("Evaluate 📝")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(evalButton);

  await channel.send({
    content: "**Player Evaluation Time!** 🌟",
    ...embedData,
    components: [row],
  });

  myLogs(client, "success", "Evaluation message sent successfully!");
};

const PAGE_SIZE = 25;

export const handleEvaluateButton = async (client, interaction, page = 0) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "evaluate_player") return;

  await interaction.deferReply({ ephemeral: true });

  const allUsers = await getAllPlayers();

  if (!allUsers.length) {
    return interaction.editReply({
      content: "✅ All players are already evaluated!",
    });
  }

  const users = allUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const options = await Promise.all(
    users.map(async (u) => {
      if (!u.discord_id) {
        console.log("⚠️ User tanpa discord_id:", u);
        return {
          label: "Unknown (No ID)",
          value: "0",
        };
      }

      const userData = await fetchUser(client, u.discord_id);

      return {
        label: userData?.globalName || "Unknown",
        value: String(u.discord_id),
      };
    })
  );

  const select = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_player_to_rank")
      .setPlaceholder(`Page ${page + 1}`)
      .addOptions(options)
  );

  // tombol prev / next
  const prevBtn = new ButtonBuilder()
    .setCustomId(`rank_prev_${page}`)
    .setLabel("⬅️ Prev")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page === 0);

  const nextBtn = new ButtonBuilder()
    .setCustomId(`rank_next_${page}`)
    .setLabel("➡️ Next")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled((page + 1) * PAGE_SIZE >= allUsers.length);

  const buttons = new ActionRowBuilder().addComponents(prevBtn, nextBtn);

  await interaction.editReply({
    content: "Choose a player to eval:",
    components: [select, buttons],
  });
};

export const handlePagination = async (client, interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("rank_")) return;

  await interaction.deferUpdate();

  const [_, direction, pageStr] = interaction.customId.split("_");
  let page = parseInt(pageStr);

  page = direction === "next" ? page + 1 : page - 1;

  const allUsers = await getAllPlayers();
  const PAGE_SIZE = 25;

  const users = allUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const options = await Promise.all(
    users.map(async (u) => {
      const userData = await fetchUser(client, u.discord_id);
      return {
        label: `${userData?.displayName || "Unknown"}`,
        value: u.discord_id,
      };
    })
  );

  const select = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select_player_to_rank")
      .setPlaceholder(`Page ${page + 1}`)
      .addOptions(options)
  );

  const prevBtn = new ButtonBuilder()
    .setCustomId(`rank_prev_${page}`)
    .setLabel("⬅️ Prev")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page === 0);

  const nextBtn = new ButtonBuilder()
    .setCustomId(`rank_next_${page}`)
    .setLabel("➡️ Next")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled((page + 1) * PAGE_SIZE >= allUsers.length);

  const buttons = new ActionRowBuilder().addComponents(prevBtn, nextBtn);

  await interaction.editReply({
    content: "Choose a player to eval:",
    components: [select, buttons],
  });
};

export const handleSelectPlayer = async (client, interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "select_player_to_rank") return;

  const player = interaction.values[0];
  const user = interaction.user;

  if (player === user.username) {
    myLogs(client, "warn", `${user.username} is trying to eval himself`);
    return interaction.reply({
      content: "🚫 You can’t eval yourself, silly!",
      ephemeral: true,
    });
  }

  const fetchedUser = await fetchUser(client, player);
  const displayName = fetchedUser?.displayName || "Unknown";

  myLogs(client, "loading", `${user.username} selected ${displayName}!`);

  const modal = new ModalBuilder()
    .setCustomId(`rank_modal_${player}`)
    .setTitle(`🏀 Rank ${displayName}`);

  const skills = [
    "offense",
    "defense",
    "playmaking",
    "style_mastery",
    "vision",
  ];
  const inputs = skills.map((skill) =>
    new TextInputBuilder()
      .setCustomId(skill)
      .setLabel(`${skill} (1.0 - 10.0)`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Example: 8.5")
      .setRequired(true)
  );

  modal.addComponents(
    inputs.map((i) => new ActionRowBuilder().addComponents(i))
  );

  await interaction.showModal(modal);
};

export const handleModalSubmit = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("rank_modal_")) return;

  const player = interaction.customId.replace("rank_modal_", "");
  const skills = [
    "offense",
    "defense",
    "playmaking",
    "style_mastery",
    "vision",
  ];

  const fetchedUser = await fetchUser(client, player);
  const displayName = fetchedUser?.displayName || "Unknown";

  const data = {};
  for (const s of skills) {
    data[s] = parseFloat(interaction.fields.getTextInputValue(s));
  }

  // 🧮 Calculate the average score
  const total = Object.values(data).reduce((acc, val) => acc + val, 0);
  const ovr = total / skills.length;

  // find user_id based on username
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("discord_id")
    .eq("discord_id", player)
    .single();

  if (userError || !userData) {
    myLogs("🔎  User not found:", userError);
    return interaction.reply({
      content: "❌ Player not found in database.",
      ephemeral: true,
    });
  }

  const discordId = userData.discord_id;

  // Save to rankings
  const { error } = await supabase.from("evals").insert([
    {
      id: nanoIdFormat("EID", 10),
      created_at: new Date().toISOString(),
      ...data,
      discord_id: discordId,
      ovr,
    },
  ]);

  if (error) {
    myLogs(client, "error", `Error saving ranking: ${JSON.stringify(error, null, 2)}`);
    return interaction.reply({
      content: "❌ Failed to save data.",
      ephemeral: true,
    });
  }

  myLogs(
    client,
    "success",
    `${interaction.user.username} have ranked ${displayName}`
  );

  await interaction.reply({
    content: `✅ Ranking for **${displayName}** saved successfully! Average rank: **${ovr.toFixed(
      2
    )}** 🏀`,
    ephemeral: true,
  });
};
