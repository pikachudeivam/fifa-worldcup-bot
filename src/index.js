require("dotenv").config();
const axios = require("axios");
const cron = require("node-cron");
const { Client, GatewayIntentBits, Events } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);

  cron.schedule("*/15 * * * *", async () => {
    try {
      const channel = await client.channels.fetch(process.env.CHANNEL_ID);

      const res = await axios.get(
        "https://v3.football.api-sports.io/fixtures?live=all",
        {
          headers: {
            "x-apisports-key": process.env.FOOTBALL_API_KEY
          }
        }
      );

      const matches = res.data.response;
      if (!matches.length) return;

      for (const match of matches) {
        await channel.send(
          `⚽ ${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}`
        );
      }
    } catch (err) {
      console.error(err.message);
    }
  });
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("🏆 FIFA Bot Online");
  }
});

client.login(process.env.DISCORD_TOKEN);
