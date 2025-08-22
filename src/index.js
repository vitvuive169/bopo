import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { PREFIX } from './config.js';

// Prisma
import { prisma } from './lib/db.js';

// Commands
import * as balance from './commands/balance.js';
import * as daily from './commands/daily.js';
import * as coinflip from './commands/coinflip.js';
import * as slots from './commands/slots.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const commands = new Map();
for (const cmd of [balance, daily, coinflip, slots]) {
  commands.set(cmd.name, cmd);
}

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, prisma);
  } catch (err) {
    console.error(err);
    await message.reply("❌ Có lỗi xảy ra khi chạy lệnh này.");
  }
});

client.login(process.env.DISCORD_TOKEN);
