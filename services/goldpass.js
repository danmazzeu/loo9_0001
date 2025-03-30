const { getGoldPassInfo } = require('../repositories/repository');
const moment = require('moment-timezone');
const path = require('path');

const logMessage = async (ctx) => {
    try {
        const now = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY - HH:mm:ss');
        const userName = ctx.from.username || ctx.from.first_name;
        const logEntry = `[${now}] ${userName}: ${ctx.message.text}`;
        console.log(logEntry);
    } catch (err) {
        console.error('Erro ao registrar mensagem:', err);
    }
};

const handleGoldPassCommand = async (ctx) => {
    try {
        await logMessage(ctx);
        const userName = ctx.from.username || `${ctx.from.first_name}`;

        const goldpassInfo = await getGoldPassInfo();

        if (!goldpassInfo || !goldpassInfo.startTime || !goldpassInfo.endTime) {
            await ctx.reply(`*${userName}* - Informações do bilhete não encontradas.`, { parse_mode: "Markdown" });
            return;
        }

        const startDate = moment(goldpassInfo.startTime).tz('America/Sao_Paulo').format('DD/MM/YYYY');
        const endDate = moment(goldpassInfo.endTime).tz('America/Sao_Paulo').format('DD/MM/YYYY');
        
        const now = moment().tz('America/Sao_Paulo');
        const daysRemaining = moment(goldpassInfo.endTime).diff(now, 'days');
        
        let timeRemainingMessage = `*Tempo Restante*: _${daysRemaining} dia(s)_`;

        if (daysRemaining < 1) {
            const hoursRemaining = moment(goldpassInfo.endTime).diff(now, 'hours');
            const minutesRemaining = moment(goldpassInfo.endTime).diff(now, 'minutes') % 60;
            const secondsRemaining = moment(goldpassInfo.endTime).diff(now, 'seconds') % 60;
            
            timeRemainingMessage = `*Tempo Restante*: _${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s_`;
        }

        const goldPassMessage = [
            `# Informações do Bilhete Dourado (Solicitado por: *${userName})*\n`,
            `*Data de Início*: _${startDate}_`,
            `*Data do Término*: _${endDate}_`,
            timeRemainingMessage
        ].join("\n");

        const imagePath = path.resolve(__dirname, '..', 'images', 'goldpass.jpg');

        await ctx.replyWithPhoto({ source: imagePath }, {
            caption: goldPassMessage,
            parse_mode: "Markdown"
        });
    } catch (error) {
        console.error("Erro no comando /bilhete:", error);
        await ctx.reply("Ocorreu um erro ao processar o comando. Tente novamente mais tarde.", { parse_mode: "Markdown" });
    }
};

module.exports = { handleGoldPassCommand };
