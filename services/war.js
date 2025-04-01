const { getWarInfo } = require('../repositories/repository');
const moment = require('moment-timezone');

const logMessage = async (ctx) => {
    try {
        const timestamp = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY - HH:mm:ss');
        const user = ctx.from.username || ctx.from.first_name;
        const message = ctx.message.text;

        const logEntry = `[${timestamp}] ${user}: ${message}`;
        console.log(logEntry);
    } catch (err) {
        console.error('Erro ao registrar mensagem:', err);
    }
};

const formatTimeDifference = (startTime, endTime) => {
    if (!startTime || !endTime) return "_Não disponível_";
    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
    const days = Math.max(duration.days(), 0);
    const hours = String(Math.max(duration.hours(), 0)).padStart(2, '0');
    const minutes = String(Math.max(duration.minutes(), 0)).padStart(2, '0');
    const seconds = String(Math.max(duration.seconds(), 0)).padStart(2, '0');
    return `${days} dia(s) e ${hours}:${minutes}:${seconds}`;
};

const formatTimeRemaining = (time) => {
    if (!time) return "_Não disponível_";
    const duration = moment.duration(moment(time).diff(moment()));
    const days = Math.max(duration.days(), 0);
    const hours = String(Math.max(duration.hours(), 0)).padStart(2, '0');
    const minutes = String(Math.max(duration.minutes(), 0)).padStart(2, '0');
    const seconds = String(Math.max(duration.seconds(), 0)).padStart(2, '0');
    return `${days} dia(s) e ${hours}:${minutes}:${seconds}`;
};

const formatAttackDuration = (duration) => {
    if (!duration) return "_Não disponível_";
    const adjustedDuration = Math.max(duration - 30, 0);
    const minutes = String(Math.max(Math.floor(adjustedDuration / 60), 0)).padStart(2, '0');
    const seconds = String(Math.max(adjustedDuration % 60, 0)).padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const handleWarCommand = async (ctx) => {
    try {
        await logMessage(ctx);

        const message = ctx.message.text.trim();
        const clanTag = message.match(/#\w+/)?.[0];
        const user = ctx.from.username || ctx.from.first_name;

        if (!clanTag) {
            const welcomeMessage = [
                "*Comando /guerra selecionado*\n",
                "Este comando fornece informações detalhadas sobre a guerra atual do clã.",
                "Para usá-lo, basta escrever */guerra <TagDoClã>*"
            ].join("\n");
            await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
            return;
        }

        const warInfo = await getWarInfo(clanTag);
        console.log(warInfo);

        if (warInfo.state === 'notInWar') {
            const noWarMessage = [
                `\# Informações da Guerra (Solicitado por: *${user}*)\n`,
                `O clã não está em guerra no momento.`
            ].join("\n");
            await ctx.reply(noWarMessage, { parse_mode: 'Markdown' });
            return;
        }

        const warResult = warInfo.clan.stars && warInfo.opponent.stars
            ? warInfo.clan.stars > warInfo.opponent.stars 
                ? "🏆 _Vitória_" 
                : "😭 _Derrota_"
            : "⏳ _Resultado: Não disponível ainda_";

        const warMessage = [
            `\# Informações da Guerra Atual (Solicitado por: *${user}*)\n`,
            `### Informações do Clan *${warInfo.clan.name}* ###`,
            `*Nome do Clan*: _${warInfo.clan.name}_`,
            `*Tag do Clan*: _${warInfo.clan.tag}_`,
            `*Nível do Clan*: _${warInfo.clan.clanLevel}_`,
            `*Duração da Guerra*: _${formatTimeDifference(warInfo.startTime, warInfo.endTime)}_`,
            `*Tempo Restante Até a Guerra*: _${formatTimeRemaining(warInfo.startTime)}_`,
            `*Tempo Restante Até o Fim da Guerra*: _${formatTimeRemaining(warInfo.endTime)}_`,
            `*Status da Guerra*: _${warInfo.state === "inWar" ? "Em batalha" : "Fora de guerra"}_`,
            `*Tamanho da Equipe do Clan*: _${warInfo.teamSize || "_Não disponível_"}_`,
            `*Total de Ataques Realizados*: _${warInfo.clan.attacks} / ${warInfo.teamSize * 2}_`,
            `*Estrelas Atuais da Guerra*: _${warInfo.clan.stars}_`,
            `*Percentual de Destruição*: _${warInfo.clan.destructionPercentage || "_Não disponível_"}%_`,
            `\n### Informações do Clan Oponente ###`,
            `*Nome do Clan Oponente*: _${warInfo.opponent.name ?? "_Não disponível_"}_`,
            `*Tag do Clan Oponente*: \#${warInfo.opponent.tag ?? "_Não disponível_"}`,
            `*Nível do Clan Oponente*: _${warInfo.opponent.clanLevel ?? "_Não disponível_"}_`,
            `*Ataques do Clã Oponente*: _${warInfo.opponent.attacks ? `${warInfo.opponent.attacks} / ${warInfo.teamSize * 2}` : "_Não disponível_"}_`,
            `*Estrelas do Clan Oponente*: _${warInfo.opponent.stars ?? "_Não disponível_"}_`,
            `*Percentual de Destruição do Clan Oponente*: _${warInfo.opponent.destructionPercentage ?? "_Não disponível_"}%_`
        ].join("\n");

        const warResultMessage = [
            `\n### Resultado da Guerra ###\n${warResult}`
        ].join("\n");

        const filteredMembers = warInfo.clan.members?.map(member => {
            const totalStars = member.attacks?.reduce((sum, attack) => sum + (attack.stars || 0), 0) || 0;
            return { ...member, totalStars };
        });

        filteredMembers.sort((a, b) => (a.mapPosition || Infinity) - (b.mapPosition || Infinity));

        const starsToIcons = (stars) => {
            const fullStars = '⭐';
            const emptyStars = '';
            return fullStars.repeat(stars) + emptyStars.repeat(3 - stars);
        };

        let memberInfoMessage = filteredMembers.length
            ? [
                "### Membros em Guerra ###\n",
                filteredMembers.map((member) => {
                    const totalStars = member.attacks?.reduce((sum, attack) => sum + (attack.stars || 0), 0) || 0;

                    const mirrorAttack = member.attacks?.find((ataque, index) => {
                        const oponenteAtacado = warInfo.opponent.members.find(oponente => oponente.tag === ataque.defenderTag);
                        return oponenteAtacado && oponenteAtacado.mapPosition === member.mapPosition;
                    });

                    const atacouOProprioEspelho = mirrorAttack
                        ? mirrorAttack === member.attacks[0]
                            ? "_✅ Espelho no primeiro ataque_"
                            : "_❌ Espelho no segundo ataque_"
                        : "_⚠️ Não atacou o espelho!_";

                    return [
                        `*Posição no Mapa*: ${member.mapPosition || "Não disponível"}`,
                        `*Nome*: ${member.name}`,
                        `*Tag*: ${member.tag}`,
                        `*Nível do Centro de Vila*: ${member.townhallLevel || "Não disponível"}`,
                        `*Ataques Disponíveis*: ${member.attacks ? `${2 - member.attacks.length} / 2` : `2`}`,
                        atacouOProprioEspelho,
                        member.attacks?.length
                            ? `\n*Relatório de Ataques*:\n${member.attacks.map(attack => {
                                const oponenteAtacado = warInfo.opponent.members.find(oponente => oponente.tag === attack.defenderTag);
                                const posicaoOponenteAtacado = oponenteAtacado ? oponenteAtacado.mapPosition : "Não encontrado";
                                return `*⚔️ Tag do Alvo*: ${attack.defenderTag || "Não disponível"}\n*▪️ Posição no mapa*: ${posicaoOponenteAtacado}\n*▪️ Estrelas*: ${starsToIcons(attack.stars)}\n*▪️ Destruição*: ${attack.destructionPercentage || "Não disponível"}%\n*▪️ Duração do Ataque*: ${formatAttackDuration(attack.duration)}\n`;
                            }).join("\n")}`
                            : "_⚠️ Nenhum ataque realizado!_\n"
                    ].join("\n");
                }).join("------------------------------------------------------------\n")
            ].join("\n")
            : "_Nenhum dado de membros disponível._";

        const bestPlayer = filteredMembers.reduce((best, member) => {
            if (!member.attacks || member.attacks.length === 0) return best;
        
            const totalStars = member.attacks.reduce((sum, attack) => sum + attack.stars, 0);
            const totalDestruction = member.attacks.reduce((sum, attack) => sum + (attack.destructionPercentage || 0), 0);
        
            const bestAttack = member.attacks.filter(attack => attack.stars === 3).reduce((bestAttack, attack) => {
                return !bestAttack || attack.destructionPercentage > bestAttack.destructionPercentage || 
                        (attack.destructionPercentage === bestAttack.destructionPercentage && attack.duration < bestAttack.duration)
                    ? attack 
                    : bestAttack;
            }, null);
        
            if (!best || 
                totalStars > best.totalStars ||
                (totalStars === best.totalStars && totalDestruction > best.totalDestruction) ||
                (totalStars === best.totalStars && totalDestruction === best.totalDestruction && bestAttack?.duration < best.bestDuration)) {
                return {
                    name: member.name,
                    totalStars,
                    totalDestruction,
                    bestDuration: bestAttack ? bestAttack.duration : "_Ataque não realizado_",
                    individualContributions: member.attacks.map(attack => ({
                        stars: attack.stars,
                        destruction: attack.destructionPercentage || "_Não disponível_",
                        duration: attack.duration || "_Não disponível_"
                    }))
                };
            }
        
            return best;
        }, null);

        const worstPlayer = filteredMembers.reduce((worst, member) => {
            if (!member.attacks || member.attacks.length === 0) return worst;
        
            const totalStars = member.attacks.reduce((sum, attack) => sum + attack.stars, 0);
        
            const worstAttack = member.attacks.reduce((worstAttack, attack) => {
                return !worstAttack || 
                        attack.destructionPercentage < worstAttack.destructionPercentage || 
                        (attack.destructionPercentage === worstAttack.destructionPercentage && attack.duration > worstAttack.duration)
                    ? attack 
                    : worstAttack;
            }, null);
        
            if (!worst || 
                totalStars < worst.totalStars || 
                (totalStars === worst.totalStars && worstAttack.destructionPercentage < worst.destructionPercentage) || 
                (totalStars === worst.totalStars && worstAttack.destructionPercentage === worst.destructionPercentage && worstAttack.duration > worst.bestDuration)) {
                return {
                    name: member.name,
                    totalStars,
                    worstDuration: worstAttack ? worstAttack.duration : "_Ataque não realizado_",
                    worstDestruction: worstAttack ? worstAttack.destructionPercentage : "_Não disponível_",
                    individualContributions: member.attacks.map(attack => ({
                        stars: attack.stars,
                        destruction: attack.destructionPercentage || "_Não disponível_",
                        duration: attack.duration || "_Não disponível_"
                    }))
                };
            }
        
            return worst;
        }, null);

        const resultMessage = [
            `\n### Melhor Aliado ###\n*Nome*: _${bestPlayer?.name || "_Não disponível_"}_`,
            `*Total de Estrelas*: _${bestPlayer?.totalStars || "_Não disponível_"}_`,
            `*Destruição Total*: _${bestPlayer?.totalDestruction || "_Não disponível_"}%_`,
            `*Duração do Melhor Ataque*: _${bestPlayer?.bestDuration ? formatAttackDuration(bestPlayer.bestDuration) : "_Não disponível_"}_`,
            `*Contribuições por Ataque*: ${bestPlayer?.individualContributions.length > 0 
                ? bestPlayer.individualContributions.map(c => `\n💥 *Estrelas*: _${c.stars}_, *Destruição*: _${c.destruction}%_, *Duração*: _${formatAttackDuration(c.duration)}_`).join("") 
                : "_Nenhuma contribuição realizada_"}`,

            `\n### Pior Aliado ###\n*Nome*: _${worstPlayer?.name || "_Não disponível_"}_`,
            `*Total de Estrelas*: _${worstPlayer?.totalStars || "_Não disponível_"}_`,
            `*Destruição do Pior Ataque*: _${worstPlayer?.worstDestruction || "_Não disponível_"}%_`,
            `*Duração do Pior Ataque*: _${worstPlayer?.worstDuration ? formatAttackDuration(worstPlayer.worstDuration) : "_Não disponível_"}_`,
            `*Contribuições por Ataque*: ${worstPlayer?.individualContributions.length > 0
                ? worstPlayer.individualContributions.map(c => `\n💥 *Estrelas*: _${c.stars}_, *Destruição*: _${c.destruction}%_, *Duração*: _${formatAttackDuration(c.duration)}_`).join("") 
                : "_Nenhuma contribuição realizada_"}`
        ].join("\n");

        await ctx.reply(warMessage, { parse_mode: 'Markdown' });
        await ctx.reply(warResultMessage, { parse_mode: 'Markdown' });
        await ctx.reply(resultMessage, { parse_mode: 'Markdown' });
        await ctx.reply(memberInfoMessage, { parse_mode: 'Markdown' });
    } catch (err) {
        console.error(err);
        await ctx.reply("_Erro ao obter informações da guerra._", { parse_mode: 'Markdown' });
    }
};

module.exports = { handleWarCommand };