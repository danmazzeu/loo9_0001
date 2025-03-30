const { getRaidInfo } = require('../repositories/repository');
const moment = require('moment-timezone');

const logMessage = async (ctx) => {
    try {
        const now = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY - HH:mm:ss');
        const userName = ctx.from.username || ctx.from.first_name;
        const messageText = ctx.message.text;

        const logEntry = `[${now}] ${userName}: ${messageText}`;
        console.log(logEntry);
    } catch (err) {
        console.error('Erro ao registrar mensagem:', err);
    }
};

const handleRaidCommand = async (ctx) => {
    try {
        await logMessage(ctx);

        const message = ctx.message.text.trim();
        const clanTag = message.match(/#\w+/);
        const userName = ctx.from.username || `${ctx.from.first_name}`;

        if (!clanTag || !clanTag[0]) {
            const welcomeMessage = [
                `*Comando /raid selecionado*\n`,
                "Este comando fornece informações detalhadas sobre o raid de um clan.",
                "Para usá-lo, basta escrever */raid <TagDoClã>*"
            ].join("\n");
            await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
            return;
        }

        const tag = clanTag[0];
        const raidInfo = await getRaidInfo(tag);

        console.log(raidInfo);

        if (raidInfo && !raidInfo.error) {
            let raidMessage = `*Informações do Raid do Clã ${tag}*\n\n`;
            raidMessage += `*Distrito Capital:* ${raidInfo.capitalDistrict.name}\n`;
            raidMessage += `*Ataques:* ${raidInfo.attackCount}\n`;
            raidMessage += `*Destruição:* ${raidInfo.destructionPercentage}%\n`;
            raidMessage += `*Distritos Atacados:* ${raidInfo.districtsAttacked.map(district => district.name).join(', ')}\n`;
            // Adicione mais informações conforme necessário
            await ctx.reply(raidMessage, { parse_mode: "Markdown" });
        }

        if (!raidInfo) {
            await ctx.reply(`*${userName}* - Clã não encontrado ou tag inválida.`, { parse_mode: "Markdown" });
            return;
        }

        if (raidInfo.error) {
            await ctx.reply(`⚠️ *${userName}*, Servidor está em manutenção no momento. Tente novamente mais tarde.`, { parse_mode: "Markdown" });
            return;
        }
    } catch (error) {
        console.error("Erro no comando /raid:", error);
        await ctx.reply("Ocorreu um erro ao processar o comando. Tente novamente mais tarde.", { parse_mode: "Markdown" });
    }
};

module.exports = { handleRaidCommand };