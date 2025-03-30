const { getRaidInfo } = require('../repositories/repository');
const moment = require('moment-timezone');

const MAX_MESSAGE_LENGTH = 4000;

const sendLongMessage = async (ctx, message) => {
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

        let raidMessage = `*Histórico de Raids do Clã ${tag}*\n\n`;

        raidInfo.items.forEach((raid, index) => {
            const startTime = moment(raid.startTime).tz('America/Sao_Paulo').format('DD/MM/YYYY - HH:mm:ss');
            const endTime = moment(raid.endTime).tz('America/Sao_Paulo').format('DD/MM/YYYY - HH:mm:ss');

            raidMessage += `*Raid ${index + 1} (${raid.state})*\n`;
            raidMessage += `Início: ${startTime}\n`;
            raidMessage += `Fim: ${endTime}\n`;
            raidMessage += `Saque Total: ${raid.capitalTotalLoot}\n`;
            raidMessage += `Raids Concluídos: ${raid.raidsCompleted}\n`;
            raidMessage += `Ataques Totais: ${raid.totalAttacks}\n`;
            raidMessage += `Distritos Destruídos: ${raid.enemyDistrictsDestroyed}\n`;
            raidMessage += `Recompensa Ofensiva: ${raid.offensiveReward}\n`;
            raidMessage += `Recompensa Defensiva: ${raid.defensiveReward}\n\n`;

            if (raid.defenseLog && raid.defenseLog.length > 0) {
                raidMessage += `🔰 *Defesa do Clã*\n`;
                raid.defenseLog.forEach((defense, dIndex) => {
                    raidMessage += `🔹 *Defesa ${dIndex + 1}*\n`;
                    if (defense.defender) {
                        raidMessage += `Defensor: ${defense.defender.name} (Tag: ${defense.defender.tag})\n`;
                        raidMessage += `Nível: ${defense.defender.level}\n`;
                    } else {
                        raidMessage += `Defensor: Desconhecido\n`;
                    }
                    raidMessage += `Ataques Sofridos: ${defense.attackCount}\n`;
                    raidMessage += `Distritos Atacados: ${defense.districtCount}\n`;
                    raidMessage += `Distritos Destruídos: ${defense.districtsDestroyed}\n\n`;
                });
            }
        });

        await sendLongMessage(ctx, raidMessage);
    } catch (error) {
        console.error("Erro no comando /raid:", error);
        await ctx.reply("Ocorreu um erro ao processar o comando. Tente novamente mais tarde.", { parse_mode: "Markdown" });
    }
};

module.exports = { handleRaidCommand };