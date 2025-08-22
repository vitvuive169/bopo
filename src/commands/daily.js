import { prisma } from "../prisma.js";

export async function execute(ctx) {
  const userId = ctx.user.id;

  let user = await prisma.user.findUnique({ where: { discordId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { discordId: userId, balance: 1000 }
    });
  }

  const now = new Date();
  const lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;

  let streak = user.streak || 0;
  let baseReward = 500;

  if (lastDaily) {
    const diffDays = Math.floor((now - lastDaily) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      // ngày hôm sau liên tiếp → tăng streak
      streak += 1;
    } else if (diffDays === 0) {
      return ctx.reply("❌ Bạn đã nhận daily hôm nay rồi, quay lại vào ngày mai!");
    }
  } else {
    streak = 1; // lần đầu tiên
  }

  // phần thưởng = base * streak (VD: 500, 1000, 1500, …)
  const reward = baseReward * streak;

  // cập nhật DB
  user = await prisma.user.update({
    where: { discordId: userId },
    data: {
      balance: { increment: reward },
      lastDaily: now,
      streak: streak
    }
  });

  return ctx.reply(
    `🎁 Bạn nhận được **${reward} coins** hôm nay!\n🔥 Chuỗi streak: ${streak} ngày liên tiếp.\n💰 Số dư hiện tại: ${user.balance} coins.`
  );
}
