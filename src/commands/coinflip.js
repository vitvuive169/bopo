export const name = "coinflip";

export async function execute(message, args, prisma) {
  const amount = parseInt(args[0]);
  if (isNaN(amount) || amount <= 0) return message.reply("❌ Số tiền cược không hợp lệ.");

  const userId = message.author.id;
  let user = await prisma.user.findUnique({ where: { discordId: userId } });
  if (!user || user.balance < amount) return message.reply("Bạn không đủ tiền để cược.");

  const win = Math.random() < 0.5;
  const newBalance = user.balance + (win ? amount : -amount);

  await prisma.user.update({
    where: { discordId: userId },
    data: { balance: newBalance }
  });

  await message.reply(
    win
      ? `🎉 Bạn thắng! +${amount} coins. Số dư: ${newBalance}`
      : `💀 Bạn thua! -${amount} coins. Số dư: ${newBalance}`
  );
}
