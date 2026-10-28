
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== إعدادات الديوان =====
const SERVER_NAME = "ديوان دحوم & وليد";
const PREFIX = "!";

const LOGO_URL = "";   // ضع رابط الشعار المباشر هنا
const BANNER_URL = ""; // ضع رابط البانر المباشر هنا

const REVIEW_CHANNEL_ID =
  process.env.REVIEW_CHANNEL_ID;

// اللون الوردي
const PINK = 0xD879B5;

// ===== إنشاء رسالة التقديم =====
function createApplicationMessage() {
  const embed = new EmbedBuilder()
    .setColor(PINK)
    .setTitle(`بوابة التقديمات | ${SERVER_NAME}`)
    .setDescription([
      "حياك الله في ديوان دحوم & وليد.",
      "",
      "تبي تنضم لفريقنا؟ اختر القسم المناسب لك",
      "وعبّئ نموذج التقديم بالمعلومات المطلوبة.",
      "",
      "╭・**التقديم الإداري**",
      "للمهتمين بالإشراف والتنظيم ومساعدة الإدارة.",
      "",
      "╭・**صنّاع المحتوى TikTok**",
      "لصناع المحتوى الراغبين في الانضمام إلى الديوان.",
      "",
      "━━━━━━━━━━━━━━━━",
      "يرجى التأكد من صحة بياناتك قبل إرسال الطلب.",
      "سيتم مراجعة طلبك من قبل الإدارة."
    ].join("\n"))
    .setFooter({
      text: `${SERVER_NAME} • نظام التقديمات`
    })
    .setTimestamp();

  if (LOGO_URL) embed.setThumbnail(LOGO_URL);
  if (BANNER_URL) embed.setImage(BANNER_URL);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("apply_admin")
      .setLabel("التقديم الإداري")
      .setEmoji("🛡️")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("apply_creator")
      .setLabel("صنّاع المحتوى TikTok")
      .setEmoji("🎬")
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}

// ===== أسئلة النماذج =====
function createModal(type) {
  const isAdmin = type === "admin";

  const modal = new ModalBuilder()
    .setCustomId(`submit_${type}`)
    .setTitle(
      isAdmin ? "التقديم الإداري" : "تقديم صانع محتوى"
    );

  const questions = isAdmin
    ? [
        ["name", "اسمك", "اكتب اسمك", true],
        ["age", "عمرك", "اكتب عمرك", true],
        ["experience", "خبراتك الإدارية", "اذكر خبراتك", true],
        ["reason", "سبب التقديم", "لماذا تريد الانضمام؟", true],
        ["time", "وقت نشاطك", "متى تكون متواجدًا؟", true]
      ]
    : [
        ["name", "اسمك", "اكتب اسمك", true],
        ["account", "حساب TikTok", "اسم المستخدم أو رابط الحساب", true],
        ["followers", "عدد المتابعين", "عدد تقريبي", true],
        ["content", "نوع محتواك", "ما نوع المحتوى الذي تقدمه؟", true],
        ["reason", "سبب الانضمام", "لماذا تريد الانضمام؟", true]
      ];

  modal.addComponents(
    ...questions.map(([id, label, placeholder, required]) => {
      const input = new TextInputBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setPlaceholder(placeholder)
        .setStyle(
          ["experience", "reason", "content"].includes(id)
            ? TextInputStyle.Paragraph
            : TextInputStyle.Short
        )
        .setRequired(required)
        .setMaxLength(500);

      return new ActionRowBuilder().addComponents(input);
    })
  );

  return modal;
}

// ===== تشغيل البوت =====
client.once("ready", () => {
  console.log(`تم تشغيل البوت: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.content.trim() !== `${PREFIX}نشر_التقديم`) return;

  if (!message.member.permissions.has(
    PermissionFlagsBits.Administrator
  )) {
    return message.reply("هذا الأمر مخصص للإدارة فقط.");
  }

  await message.channel.send(createApplicationMessage());
});

// ===== الأزرار والنماذج =====
client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "apply_admin") {
      return interaction.showModal(createModal("admin"));
    }

    if (interaction.customId === "apply_creator") {
      return interaction.showModal(createModal("creator"));
    }
  }

  if (!interaction.isModalSubmit()) return;

  const isAdmin = interaction.customId === "submit_admin";
  const isCreator = interaction.customId === "submit_creator";

  if (!isAdmin && !isCreator) return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const reviewChannel = await client.channels.fetch(
      REVIEW_CHANNEL_ID
    );

    if (!reviewChannel || !reviewChannel.isTextBased()) {
      throw new Error("روم المراجعة غير صحيح.");
    }

    const fields = isAdmin
      ? [
          ["الاسم", "name"],
          ["العمر", "age"],
          ["الخبرات الإدارية", "experience"],
          ["سبب التقديم", "reason"],
          ["وقت النشاط", "time"]
        ]
      : [
          ["الاسم", "name"],
          ["حساب TikTok", "account"],
          ["عدد المتابعين", "followers"],
          ["نوع المحتوى", "content"],
          ["سبب الانضمام", "reason"]
        ];

    const embed = new EmbedBuilder()
      .setColor(PINK)
      .setTitle(
        isAdmin
          ? "طلب تقديم إداري جديد"
          : "طلب صانع محتوى جديد"
      )
      .setDescription(
        `**المتقدم:** ${interaction.user}\n` +
        `**معرّف المستخدم:** ${interaction.user.id}`
      )
      .addFields(
        fields.map(([name, id]) => ({
          name,
          value: interaction.fields.getTextInputValue(id),
          inline: false
        }))
      )
      .setFooter({ text: SERVER_NAME })
      .setTimestamp();

    await reviewChannel.send({ embeds: [embed] });

    await interaction.editReply({
      content: "تم استلام تقديمك بنجاح. شكرًا لك!"
    });
  } catch (error) {
    console.error(error);

    await interaction.editReply({
      content: "تعذر إرسال طلبك. تواصل مع الإدارة."
    });
  }
});

client.login(process.env.MTU2NDc4NTc4Nzk1Njg4NzYyMg.GE8zHe.t7-MJXPSUOjnRTgJr-VMSJreMIm-EFpHKZbFY8);
