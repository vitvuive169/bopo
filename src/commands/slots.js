import { prisma } from "../prisma.js";

export async function execute(ctx, args) {
  const userId = ctx.user.id;
  let bet = parseInt(args[0]);

  if (!bet || bet <= 0) {
    return ctx.reply("❌ Bạn phải đặt cược số tiền hợp lệ!");
  }

  let user = await prisma.user.findUnique({ where: { discordId: userId } });
  if (!user || user.balance < bet) {
    return ctx.reply("💸 Bạn không đủ tiền để đặt cược!");
  }

  // Các ký tự & tỉ lệ rơi
  const symbols = [
    { emoji: "🍌", weight: 120 },
    { emoji: "🍄", weight: 60 },
    { emoji: "🍰", weight: 10 },
    { emoji: "🍇", weight: 6 },
    { emoji: "⭐", weight: 3 },
    { emoji: "💎", weight: 1 }
  ];

  // Hàm random có trọng số
  function roll() {
    const total = symbols.reduce((a, s) => a + s.weight, 0);
    let rand = Math.floor(Math.random() * total);
    for (let s of symbols) {
      if (rand < s.weight) return s.emoji;
      rand -= s.weight;
    }
  }

  const slot1 = roll();
  const slot2 = roll();
  const slot3 = roll();

  let reward = -bet; // mặc định là thua
  let resultMsg = `😢 Không may rồi, bạn thua **${bet} coins**.`;

  // Chỉ thắng khi cả 3 giống nhau
  if (slot1 === slot2 && slot2 === slot3) {
    switch (slot1) {
      case "🍌": reward = bet * 1; break;
      case "🍄": reward = bet * 2; break;
      case "🍰": reward = bet * 3; break;
      case "🍇": reward = bet * 5; break;
      case "⭐": reward = bet * 10; break;
      case "💎": reward = bet * 50; break;
    }
    resultMsg = `🎉 Ghê gớm vậy 😳 bạn vừa thắng **${reward} coins**!`;
  }

  // Cập nhật số dư
  await prisma.user.update({
    where: { discordId: userId },
    data: {
      balance: { increment: reward }
    }
  });

  return ctx.reply(
    `🎰 [ ${slot1} | ${slot2} | ${slot3} ]\n${resultMsg}\n💰 Số dư hiện tại: ${(user.balance + reward)} coins.`
  );
}
