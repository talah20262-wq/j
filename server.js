const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const axios = require('axios');

// 1. ربط وإعداد قاعدة البيانات Firebase الخاصة بك
admin.initializeApp({
    credential: admin.credential.applicationDefault(), 
    databaseURL: "https://mama-c6e6b-default-rtdb.firebaseio.com/"
});

const db = admin.database();
const configRef = db.ref("server_config");

// 2. توكن بوت تليجرام المعتمد الخاص بك
const token = '8338334656:AAFJosPcNri8hJeERp7Si-JXzSkxmBAmwG8';
const bot = new TelegramBot(token, { polling: true });

console.log("-> السيرفر يعمل الآن ومراقب دائم للفايربيس...");

// 3. مراقبة التغييرات من لوحة التحكم وتطبيقها فوراً على البوت
configRef.on('value', async (snapshot) => {
    const config = snapshot.val();
    if (!config) return;

    // تحديث الاسم ظاهرياً عبر التليجرام API
    if (config.botName) {
        try {
            await bot.setMyName({ name: config.botName });
            console.log("تم تحديث اسم البوت إلى:", config.botName);
        } catch (err) {
            console.error("خطأ في تحديث الاسم:", err.message);
        }
    }
});

// 4. معالجة رسائل العملاء بالذكاء الاصطناعي بناءً على مفتاحك المخزن
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatId, "مرحباً بك في النظام الذكي. جاري تخصيص الردود...");
        return;
    }

    // قراءة الـ API Key والمحرك الحالي من الفايربيس
    const snapshot = await configRef.once('value');
    const config = snapshot.val();

    if (config && config.apiKey) {
        try {
            let aiReply = "";
            
            if (config.engine === 'gemini') {
                // استدعاء جيميناي API برمجياً
                const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.apiKey}`, {
                    contents: [{ parts: [{ text: text }] }]
                });
                aiReply = res.data.candidates[0].content.parts[0].text;
            } else {
                // استدعاء شات جي بي تي API برمجياً
                const res = await axios.post('https://api.openai.com/v1/chat/completions', {
                    model: "gpt-4o",
                    messages: [{ role: "user", content: text }]
                }, {
                    headers: { 'Authorization': `Bearer ${config.apiKey}` }
                });
                aiReply = res.data.choices[0].message.content;
            }

            bot.sendMessage(chatId, aiReply);
        } catch (error) {
            bot.sendMessage(chatId, "خطأ: تأكد من صحة الـ API Key في الموقع.");
        }
    }
});
            
