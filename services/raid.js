const { getRaidInfo, getClanInfo } = require('../repositories/repository');
const moment = require('moment-timezone');

const MAX_MESSAGE_LENGTH = 4000;

const sendLongMessage = async (ctx, message) => {
    if (!message || message.trim().length === 0) {
        return;
    }

    while (message.length > 0) {
        let chunk = message.substring(0, MAX_MESSAGE_LENGTH);
        let lastNewline = chunk.lastIndexOf('\n');
        if (lastNewline > -1 && lastNewline < MAX_MESSAGE_LENGTH) {
            chunk = message.substring(0, lastNewline);
        }
        await ctx.reply(chunk, { parse_mode: "Markdown" });
        message = message.substring(chunk.length).trim();
    }
};

const handleRaidCommand = async (ctx) => {
    try {
        const message = ctx.message.text.trim();
        const clanTag = message.match(/#\w+/);
        const userName = ctx.from.username || `${ctx.from.first_name}`;

        if (!clanTag || !clanTag[0]) {
            const welcomeMessage = `*Comando /raid selecionado*\n\nEste comando fornece informações detalhadas sobre o raid de um clã.\nPara usá-lo, basta escrever */raid <TagDoClã>*`;
            await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
            return;
        }

        const tag = clanTag[0];
        const raidInfo = await getRaidInfo(tag);

        if (!raidInfo || !raidInfo.items || raidInfo.items.length === 0) {
            await ctx.reply(`*${userName}* - Nenhuma informação de raid encontrada para este clã ou tag inválida.`, { parse_mode: "Markdown" });
            return;
        }

        if (raidInfo.error) {
            await ctx.reply(`⚠️ *${userName}*, Servidor está em manutenção no momento. Tente novamente mais tarde.`, { parse_mode: "Markdown" });
            return;
        }

        const clanInfo = await getClanInfo(tag);
        const clanName = clanInfo && clanInfo.name ? clanInfo.name : tag;

        let raidMessage = `# 5 Raids Mais Recentes do Clã *${clanName}*\n\n`;

        const recentRaids = raidInfo.items.slice(0, 5); // Pega os 5 raids mais recentes

        for (let i = recentRaids.length - 1; i >= 0; i--) {
            const raid = recentRaids[i];
            const state = raid.state === 'ongoing' ? 'Em andamento' : 'Concluído';
            raidMessage += `*🏠 Raid ${recentRaids.length - i} (${state})*\n`;

            const startTime = raid.startTime;
            const endTime = raid.endTime;

            const startTimeFormatted = startTime
                ? moment.utc(startTime).tz('America/Sao_Paulo').format('DD/MM/YYYY')
                : 'Não disponível';
            const endTimeFormatted = endTime
                ? moment.utc(endTime).tz('America/Sao_Paulo').format('DD/MM/YYYY')
                : 'Não disponível';

            raidMessage += `*Início:* _${startTimeFormatted}_\n`;
            raidMessage += `*Fim:* _${endTimeFormatted}_\n`;

            raidMessage += `*Saque Total:* _${raid.capitalTotalLoot || 'Não disponível'}_\n`;
            raidMessage += `*Raids Concluídos:* _${raid.raidsCompleted || 'Não disponível'}_\n`;
            raidMessage += `*Ataques Totais:* _${raid.totalAttacks || 'Não disponível'}_\n`;
            raidMessage += `*Distritos Destruídos:* _${raid.enemyDistrictsDestroyed || 'Não disponível'}_\n`;
            raidMessage += `*Recompensa Ofensiva:* _${raid.offensiveReward || 'Não disponível'}_\n`;
            raidMessage += `*Recompensa Defensiva:* _${raid.defensiveReward || 'Não disponível'}_\n\n`;
        }

        await sendLongMessage(ctx, raidMessage);

    } catch (error) {
        console.error("Erro no comando /raid:", error);
        await ctx.reply("Ocorreu um erro ao processar o comando. Tente novamente mais tarde.", { parse_mode: "Markdown" });
    }
};

module.exports = { handleRaidCommand };