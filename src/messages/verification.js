import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import { supabase } from "../config/supabase.js";
import { nanoIdFormat } from "../libs/utils/nanoId.js";
import { myLogs } from "../libs/utils/myLogs.js";
import { bulkDelete } from "../helper/bulkDelete.js";
import { embedBuilder } from "../helper/embedBuilder.js";

export const verification = async (client) => {
  const channelId = process.env.VERIFICATION_CHANNEL_ID;
  const channel = await client.channels.fetch(channelId);

  if (!channel) {
    myLogs(client, "warn", "Verification channel not found!");
    return;
  }

  bulkDelete(client, channel);

  const embedData = embedBuilder(
    "#ff0000",
    "🧠 Member Verification",
    "Welcome to the server! Click the button below to register as a player.\n\nOnce registered, you’ll be added to the tryout list and gain access to tryout features!",
    null,
    "Press the button only once!",
    true
  );

  const regButton = new ButtonBuilder()
    .setCustomId("verify_user")
    .setLabel("Verify Now 🚀")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(regButton);

  await channel.send({
    content: "**Welcome to the Verification Channel!** 🌟",
    ...embedData,
    components: [row],
  });

  myLogs(client, "success", "Verification message sent successfully!");
};

// === HANDLE BUTTON CLICK ===
export const handleRegisterButton = async (client, interaction) => {
  if (!interaction.isButton() || interaction.customId !== "verify_user") return;

  const member = interaction.member;
  const userId = interaction.user.id;
  const username = interaction.user.username;

  myLogs(client, "loading", `${username} is trying to register...`);

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("discord_id", userId)
    .single();

  if (existingUser) {
    myLogs(client, "alert", `${username} already registered!`);
    return interaction.reply({
      content: `❗ You are already registered, ${username}!`,
      ephemeral: true,
    });
  }

    const regionOpt = new StringSelectMenuBuilder()
    .setCustomId("select_region")
    .setPlaceholder("Select your region 🌏")
    .addOptions([
      { label: "Asia (AS)", value: "AS" },
      { label: "Europe (EU)", value: "EU" },
      { label: "North America (NA)", value: "NA" },
      { label: "Oceania (OCE)", value: "OCE" },
    ]);

  const row = new ActionRowBuilder().addComponents(regionOpt);

  return interaction.reply({
    content: "Please select your region:",
    components: [row],
    ephemeral: true,
  });
};

export const handleRegionSelect = async (client, interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== "select_region")
    return;

  const region = interaction.values[0];
  const member = interaction.member;
  const userId = interaction.user.id;

  const userData = {
    id: nanoIdFormat("USR", 10),
    discord_id: userId,
    region: region,
    account_created_at: interaction.user.createdAt.toISOString(),
  };

  const { error } = await supabase.from("users").insert(userData);

  if (error) {
    myLogs(client, "warn", "User failed to register!");
    return interaction.reply({
      content: "⚠️ Failed to register. Please try again later.",
      ephemeral: true,
    });
  }

  myLogs(client, "success", `User successfully registered in **${region}**`);
  await interaction.reply({
    content: `✅ Successfully registered in **${region}**!`,
    ephemeral: true,
  });

  // === ROLE UPDATE ===
  try {
    if (process.env.ROLE_TO_REMOVE)
      await member.roles.remove(process.env.ROLE_TO_REMOVE);

    if (process.env.ROLE_TO_ADD)
      await member.roles.add(process.env.ROLE_TO_ADD);
  } catch (err) {
    myLogs(client, "error", `Failed updating roles: ${err}`);
  }
};