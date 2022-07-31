const telegram = require("node-telegram-bot-api");
const fs = require("fs");
const uuid = require("uuid");

const token = fs.readFileSync("src/token.txt", "utf8");
const bot = new telegram(token, { polling: true });

const { performLaTeXQuery } = require("./services/quicklatex");
const { cleanCache } = require("./services/gc");

const status = {
    inlineQuery: "ready",
};

// Create cache directory if it doesn't exist
if (!fs.existsSync("./cache")) {
    fs.mkdirSync("./cache");
}

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    const image = await performLaTeXQuery(message, {
        type: "sticker",
    });

    if (!image) {
        bot.sendMessage(chatId, "Sorry, I couldn't understand your formula");
        return;
    }

    // Send the image
    bot.sendSticker(chatId, image);
});

bot.on("inline_query", async (msg) => {
    // Check if msg ends with $$
    if (!msg.query.endsWith("$$")) {
        return;
    }

    // Remove $$ from the end of the query
    msg.query = msg.query.slice(0, -2);

    if (status.inlineQuery != "ready") {
        console.log("Bot is in timeout");
        bot.answerInlineQuery(msg.id, [
            { type: "article", id: "1", title: "Try again in a few seconds" },
        ]);

        return;
    }

    status.inlineQuery = "timeout";
    setTimeout(() => {
        console.log("Timeout is over");
        status.inlineQuery = "ready";
    }, 10000);

    try {
        console.log("Received query from", msg.from.username);

        const query = msg.query;
        const image = await performLaTeXQuery(query, {
            type: "image",
        });

        if (!image) {
            return;
        }

        // Upload the image to Telegram as a sticker
        const sticker = await bot.uploadStickerFile(msg.from.id, image);

        // Create sticker set
        const sticker_set_name = `v${uuid.v4().replace(/-/g, "_")}_by_${
            (await bot.getMe()).username
        }`;

        await bot.createNewStickerSet(
            msg.from.id,
            sticker_set_name,
            "TeXy Math",
            sticker.file_id,
            "💬"
        );

        // Retrieve the sticker set
        const sticker_set_info = await bot.getStickerSet(sticker_set_name);

        // Send the sticker set
        bot.answerInlineQuery(msg.id, [
            {
                type: "sticker",
                id: uuid.v4(),
                sticker_file_id: sticker_set_info.stickers[0].file_id,
            },
        ]);
    } catch (error) {
        console.log("Unable to perform LaTeX query: ", msg.query);
    }
});

// Clean the cache at startup
cleanCache();

// Set an interval to clean up the cache
setInterval(cleanCache, 60000);

console.log("Everything up and running");
