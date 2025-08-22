export const name = "balance";

export async function execute(message, args, prisma) {
  const userId = message.author.id;
  let user = await prisma.user.findUnique({ where: { discordId: userId } });

  if (!user) {
    user = await prisma.user.create({ data: { discordId: userId } });
  }

  await message.reply(`${message.author.username} có 💰 ${user.balance} coins.`);
}
