require('dotenv').config();
const path = require('path');
const { Telegraf } = require('telegraf');
const moment = require('moment');
const axios = require('axios');
const { handlePlayerCommand } = require('./services/player');
const { handleClanCommand } = require('./services/clan');
const { handleRaidCommand } = require('./services/raid');
const { handleWarCommand } = require('./services/war');
const { handleGoldPassCommand } = require('./services/goldpass');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const userCooldown = {};

function getMoment() {
    return moment().format('DD-MM-YYYY - HH:mm:ss');
}

const welcomeMessage = (firstName) => [
    `Bem-vindo(a) *${firstName}*!`,
    "Eu sou o *Clash Lumni*, seu assistente pessoal para tudo sobre Clash of Clans!",
    "Digite */comandos* para ver as opções de comandos."
].join("\n");

const menu = [
    "*### Comandos ###*\n",
    "*/comandos* \nTodos os comandos disponíveis podem ser encontrados aqui.\n",
    "*/jogador <tag do jogador>* \nObtenha informações detalhadas sobre o perfil de um jogador.\n",
    "*/clan <tag do clã>* \nObtenha informações gerais sobre um clã.\n",
    "*/raid <tag do clã>* \nObtenha informações gerais sobre a raid de um clã.\n",
    "*/guerra* <tag do clã> \nObtenha informações sobre a guerra atual de um clã.\n",
    "*/bilhete* \nObtenha informações sobre o bilhete dourado atual.\n",
    "*/tutorial* \nImagem tutorial para conseguir a Tag, que serão utilizadas nos comandos.",
].join("\n");

bot.on("message", async (ctx) => {
    try {
        const userId = ctx.from.id;
        const chatId = ctx.chat.id;
        const now = Date.now();

        console.log(`[${getMoment()}] Chat id: ${chatId}, User id: ${userId}`);

        if (userCooldown[userId] && now - userCooldown[userId] < 30000) {
            const timeLeft = Math.ceil((30000 - (now - userCooldown[userId])) / 1000);
            await ctx.telegram.deleteMessage(chatId, ctx.message.message_id);
            await ctx.reply(`⏳ *${ctx.from.first_name}* - Por favor, aguarde ${timeLeft} segundos antes de enviar outra solicitação.`, { parse_mode: "Markdown" });
            return;
        }

        userCooldown[userId] = now;

        const isNotAllowed = ctx.message.photo ||
            (ctx.message.video && !ctx.message.video_note) ||
            (ctx.message.audio && !ctx.message.voice) ||
            ctx.message.entities?.some(entity => entity.type === 'url' || entity.type === 'text_link') ||
            ctx.message.location ||
            ctx.message.contact ||
            ctx.message.document ||
            ctx.message.sticker ||
            ctx.message.venue;

        if (isNotAllowed) {
            await ctx.telegram.deleteMessage(chatId, ctx.message.message_id);
            await ctx.reply(`⚠️ *${ctx.from.first_name}* - Não é permitido enviar imagens, vídeos (exceto notas de vídeo), áudios (exceto mensagens de voz), links, localizações, carteiras, arquivos, enquetes ou contatos.`, { parse_mode: "Markdown" });
            return;
        }

        if (ctx.chat.type === 'private') {
            await ctx.telegram.deleteMessage(chatId, ctx.message.message_id);
            console.log(`[${getMoment()}] ${ctx.from.first_name}: Mensagem privada`);
            await ctx.reply('Este bot só funciona em grupos.\nSegue abaixo o link do grupo:\n\nhttps://t.me/loo9_clashofclans_pt', { parse_mode: "Markdown" });
            return;
        }

        if (ctx.message.new_chat_members) {
            const newMembers = ctx.message.new_chat_members;
            for (const member of newMembers) {
                if (!member.is_bot) {
                    await ctx.reply(`Bem-vindo(a) ao grupo, *${member.first_name}*! Digite /comandos para ver as opções.`);
                }
            }
            return;
        }

        if (ctx.message.left_chat_member) {
            return;
        }

        const messageText = ctx.message.text?.trim().replace(/@[\w\d_]+/g, "").trim();
        const command = messageText ? messageText.split(" ")[0].toLowerCase() : '';

        if (messageText && !messageText.startsWith("/")) {
            await ctx.telegram.deleteMessage(chatId, ctx.message.message_id);
            await ctx.reply(welcomeMessage(ctx.from.first_name), { parse_mode: "Markdown" });
            return;
        }

        switch (command) {
            case "/start":
                await ctx.reply(welcomeMessage(ctx.from.first_name), { parse_mode: "Markdown" });
                console.log(`[${getMoment()}] ${ctx.from.first_name}: /start`);
                break;
            case "/comandos":
                await ctx.reply(menu, { parse_mode: "Markdown" });
                console.log(`[${getMoment()}] ${ctx.from.first_name}: /comandos`);
                break;
            case "/jogador":
                await handlePlayerCommand(ctx);
                break;
            case "/clan":
                await handleClanCommand(ctx);
                break;
            case "/raid":
                await handleRaidCommand(ctx);
                break;
            case "/guerra":
                await handleWarCommand(ctx);
                break;
            case "/bilhete":
                await handleGoldPassCommand(ctx);
                break;
            case "/tutorial":
                const imagePath = path.join(__dirname, 'images', 'tutorial.jpg');
                const tutorialMessage = `*${ctx.from.first_name}*, aqui está o tutorial para encontrar sua Tag! Depois, use */comandos* para explorar as opções.`;
                await ctx.replyWithPhoto({ source: imagePath }, { caption: tutorialMessage, parse_mode: "Markdown" });
                console.log(`[${getMoment()}] ${ctx.from.first_name}: /tutorial`);
                break;
            default:
                await ctx.reply(`⚠️ Comando desconhecido. Use */comandos* para ver as opções disponíveis.`, { parse_mode: "Markdown" });
                break;
        }
    } catch (error) {
        console.error(`[${getMoment()}] Erro ao processar comando: ${error.message}`, error);
        await ctx.reply('❌ Ocorreu um erro ao processar seu comando. Tente novamente mais tarde.');
    }
});

// Anúncios automáticos
let lastMessageId = null;
const multiply = 3;
const sendInterval = 300000 * multiply; // 15 minutos
const deleteInterval = 270000 * multiply; // 12 minutos

async function sendAndScheduleDelete() {
    const imagePath = path.join(__dirname, 'images', 'loo9.jpg');
    const caption = `_Propaganda Automática (15 min)_\n\n*Precisando de automações?*\nhttps://loo9.com.br/`;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    try {
        const sentMessage = await bot.telegram.sendPhoto(chatId, { source: imagePath }, { caption, parse_mode: "Markdown" });
        console.log(`[${getMoment()}] Imagem promocional enviada com sucesso.`);
        lastMessageId = sentMessage.message_id;

        setTimeout(async () => {
            if (lastMessageId) {
                try {
                    await bot.telegram.deleteMessage(chatId, lastMessageId);
                    console.log(`[${getMoment()}] Imagem promocional excluída.`);
                } catch (error) {
                    console.error(`[${getMoment()}] Erro ao excluir a mensagem: ${error.message}`, error);
                }
            }
        }, deleteInterval);
    } catch (error) {
        console.error(`[${getMoment()}] Erro ao enviar a imagem: ${error.message}`, error);
    }
}

setInterval(sendAndScheduleDelete, sendInterval);

async function getExternalIP() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        console.error(`[${getMoment()}] Erro ao obter IP externo: ${error.message}`, error);
        return 'IP externo não disponível';
    }
}

async function startBot() {
    try {
        const externalIP = await getExternalIP();
        console.log(`[${getMoment()}] Bot em execução. IP externo: ${externalIP}`);
        bot.launch();
    } catch (err) {
        console.error(`[${getMoment()}] Erro ao iniciar o bot: ${err.message}`, err);
        process.exit(1);
    }
}

startBot();

process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${getMoment()}] Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
    console.error(`[${getMoment()}] Uncaught Exception thrown: ${error.message}`, error);
    process.exit(1);
});