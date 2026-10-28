import discord
from discord.ext import commands
from discord.ui import Button, View, Modal, TextInput

# إعدادات البوت الأساسية
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

TOKEN = 'ضع_توكن_البوت_هنا'

# ---------------------------------------------------------
# 1. استمارة تقديم التيك توك
# ---------------------------------------------------------
class TikTokModal(Modal, title="🎵 تقديم إدارة تيك توك"):
    username = TextInput(label="اسم حسابك في تيك توك", placeholder="@username", max_length=50)
    followers = TextInput(label="عدد المتابعين الحالي", placeholder="مثال: 10K", max_length=20)
    experience = TextInput(label="خبرتك السابقة في صناعة المحتوى", style=discord.TextStyle.long, max_length=500)

    async def on_submit(self, interaction: discord.Interaction):
        embed = discord.Embed(title="✅ تم استلام طلب تيك توك", color=discord.Color.magenta())
        embed.add_field(name="الحساب", value=self.username.value, inline=False)
        embed.add_field(name="المتابعين", value=self.followers.value, inline=True)
        embed.add_field(name="الخبرة", value=self.experience.value[:100] + "..." if len(self.experience.value) > 100 else self.experience.value, inline=False)
        embed.set_footer(text=f"مقدم الطلب: {interaction.user}")
        
        # إرسال الطلب لقناة الإدارة (استبدل ID القناة برقم قناتك)
        channel = bot.get_channel(123456789012345678) 
        if channel:
            await channel.send(embed=embed)
        
        await interaction.response.send_message("تم إرسال طلبك للإدارة بنجاح! 🎉", ephemeral=True)

# ---------------------------------------------------------
# 2. استمارة التقديم الإداري
# ---------------------------------------------------------
class AdminModal(Modal, title="️ تقديم إداري للسيرفر"):
    age = TextInput(label="العمر", placeholder="مثال: 18", max_length=5)
    why_admin = TextInput(label="لماذا تريد الانضمام للإدارة؟", style=discord.TextStyle.long, max_length=1000)
    hours = TextInput(label="عدد الساعات المتاحة يومياً", placeholder="مثال: 4 ساعات", max_length=20)

    async def on_submit(self, interaction: discord.Interaction):
        embed = discord.Embed(title="✅ تم استلام طلب إداري", color=discord.Color.green())
        embed.add_field(name="العمر", value=self.age.value, inline=True)
        embed.add_field(name="الساعات المتاحة", value=self.hours.value, inline=True)
        embed.add_field(name="سبب التقديم", value=self.why_admin.value[:200] + "..." if len(self.why_admin.value) > 200 else self.why_admin.value, inline=False)
        embed.set_footer(text=f="مقدم الطلب: {interaction.user}")
        
        channel = bot.get_channel(123456789012345678)
        if channel:
            await channel.send(embed=embed)
            
        await interaction.response.send_message("تم استلام طلبك الإداري، سيتم مراجعته قريباً! 🛡️", ephemeral=True)

# ---------------------------------------------------------
# 3. تصميم الأزرار والرسالة الرئيسية
# ---------------------------------------------------------
class ApplicationView(View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="تقديم تيك توك", style=discord.ButtonStyle.blurple, emoji="🎵")
    async def tiktok_btn(self, interaction: discord.Interaction, button: Button):
        await interaction.response.send_modal(TikTokModal())

    @discord.ui.button(label="تقديم إداري", style=discord.ButtonStyle.green, emoji="️")
    async def admin_btn(self, interaction: discord.Interaction, button: Button):
        await interaction.response.send_modal(AdminModal())

# ---------------------------------------------------------
# أمر لإنشاء رسالة التقديم في الشات
# ---------------------------------------------------------
@bot.command()
@commands.has_permissions(administrator=True)
async def send_apps(ctx):
    embed = discord.Embed(
        title="ديوان ديحوم & وليد - نظام التقديم",
        description="أهلاً بك في نظام التقديمات!\nاختر نوع التقديم المناسب لك من الأزرار بالأسفل.",
        color=discord.Color.dark_pink()
    )
    embed.add_field(name=" تقديم تيك توك", value="لدعم نشاطات المؤثرين وصناعة المحتوى.", inline=False)
    embed.add_field(name="️ التقديم الإداري", value="للانضمام لطاقم الإدارة ومتابعة شؤون السيرفر.", inline=False)
    embed.set_image(url="رابط_صورة_البنر_الخاصة_بك_هنا") 
    
    view = ApplicationView()
    await ctx.send(embed=embed, view=view)

# تشغيل البوت
bot.run(TOKEN)