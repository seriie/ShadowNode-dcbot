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
import { playerEvalMessage } from "../helper/playerEvalMessage.js";
import { setEvalRank } from "../helper/setEvalRank.js";

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
    .setCustomId(`rank_modal_step1_${player}`)
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
  client.tempEval = client.tempEval || {};

  // --- STEP 1: SKILL MODAL ---
  if (interaction.customId.startsWith("rank_modal_step1")) {
    const player = interaction.customId.replace("rank_modal_step1_", "");
    const skills = [
      "offense",
      "defense",
      "playmaking",
      "style_mastery",
      "vision",
    ];

    const data = {};
    for (const s of skills) {
      data[s] = parseFloat(interaction.fields.getTextInputValue(s));
    }

    client.tempEval[interaction.user.id] = {
      player,
      skills: data,
    };

    const modal = new ModalBuilder()
      .setCustomId(`rank_modal_step2_${player}`)
      .setTitle("📝 Evaluation Details");

    const fields = [
      { id: "reasoning", label: "Reasoning", placeholder: "Why tho?" },
      {
        id: "improvement",
        label: "Improvement",
        placeholder: "What should they fix?",
      },
      { id: "note", label: "Note", placeholder: "Anything else?" },
    ];

    modal.addComponents(
      fields.map((f) =>
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(f.id)
            .setLabel(f.label)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(f.placeholder)
            .setRequired(true)
        )
      )
    );

    await interaction.reply({
      content: "Step 2 ready! Click the button below to continue :D",
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`open_step2_${player}`)
            .setLabel("Open Step 2")
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    });

    return;
  }

  // --- STEP 2: FINAL MODAL ---
  if (interaction.customId.startsWith("rank_modal_step2_")) {
    const player = interaction.customId.replace("rank_modal_step2_", "");
    const evalId = nanoIdFormat("EID", 10);

    const temp = client.tempEval[interaction.user.id];
    if (!temp) {
      return interaction.reply({
        content: "❌ Data expired, please retry.",
        ephemeral: true,
      });
    }

    const skills = temp.skills;

    const reasoning = interaction.fields.getTextInputValue("reasoning");
    const improvement = interaction.fields.getTextInputValue("improvement");
    const note = interaction.fields.getTextInputValue("note");

    const total = Object.values(skills).reduce((a, b) => a + b, 0);
    const ovr = total / Object.keys(skills).length;
    const rank = setEvalRank(ovr);

    const { data: user } = await supabase
      .from("users")
      .select("region")
      .eq("discord_id", player)
      .single();

    const region = user.region;

    const tierRoles = {
      1: {
        AS: process.env.TIER_1_AS,
        EU: process.env.TIER_1_EU,
        NA: process.env.TIER_1_NA,
      },
      2: {
        AS: process.env.TIER_2_AS,
        EU: process.env.TIER_2_EU,
        NA: process.env.TIER_2_NA,
      },
      3: {
        AS: process.env.TIER_3_AS,
        EU: process.env.TIER_3_EU,
        NA: process.env.TIER_3_NA,
      },
      4: {
        AS: process.env.TIER_4_AS,
        EU: process.env.TIER_4_EU,
        NA: process.env.TIER_4_NA,
      },
      5: {
        AS: process.env.TIER_5_AS,
        EU: process.env.TIER_5_EU,
        NA: process.env.TIER_5_NA,
      },
      6: {
        AS: process.env.TIER_6_AS,
        EU: process.env.TIER_6_EU,
        NA: process.env.TIER_6_NA,
      },
      7: {
        AS: process.env.TIER_7_AS,
        EU: process.env.TIER_7_EU,
        NA: process.env.TIER_7_NA,
      },
    };

    const userRegion = user.region || null;
    const tierNumber = parseInt(rank.replace("Tier ", ""));
    const roleId = tierRoles[tierNumber][userRegion] || null;
    const guildMember = await interaction.guild.members.fetch(player);

    const allRankRoles = Object.values(tierRoles).flatMap((t) =>
      Object.values(t)
    );

    for (const r of guildMember.roles.cache.keys()) {
      if (allRankRoles.includes(r)) {
        await guildMember.roles.remove(r);
      }
    }
    
    await guildMember.roles.add(roleId);

    const { data: userData } = await supabase
      .from("users")
      .select("discord_id")
      .eq("discord_id", player)
      .single();

    const { error } = await supabase.from("evals").insert([
      {
        id: evalId,
        created_at: new Date().toISOString(),
        discord_id: userData.discord_id,
        evaluator_dc_id: interaction.user.id,
        ovr,
        ...skills,
        reasoning,
        improvement,
        note,
        rank,
      },
    ]);

    delete client.tempEval[interaction.user.id];

    const evalResultChannelId = process.env.EVAL_RESULTS_CHANNEL_ID;
    const evalResultChannel = await interaction.client.channels
      .fetch(evalResultChannelId)
      .catch(() => null);

    const { count } = await supabase
      .from("evals")
      .select("*", { count: "exact", head: true });

    if (evalResultChannel) {
      const msg = playerEvalMessage({
        count: count || 0,
        player: userData.discord_id,
        reasoning,
        improvement,
        note,
        ovr,
        rank: rank,
        ranker: interaction.user.username,
        evalId,
      });

      await evalResultChannel.send(msg);
    }

    return interaction.reply({
      content: `✅ Evaluation saved! OVR: **${ovr.toFixed(2)}**`,
      ephemeral: true,
    });
  }
};

export const handleOpenStep2 = async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("open_step2_")) return;

  const player = interaction.customId.replace("open_step2_", "");

  const modal = new ModalBuilder()
    .setCustomId(`rank_modal_step2_${player}`)
    .setTitle("📝 Evaluation Details");

  const fields = [
    { id: "reasoning", label: "Reasoning", placeholder: "Why tho?" },
    {
      id: "improvement",
      label: "Improvement",
      placeholder: "What should they fix?",
    },
    { id: "note", label: "Note", placeholder: "Anything else?" },
  ];

  modal.addComponents(
    fields.map((f) =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(f.id)
          .setLabel(f.label)
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder(f.placeholder)
          .setRequired(true)
      )
    )
  );

  return interaction.showModal(modal);
};
