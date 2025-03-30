const { getClanInfo } = require('../repositories/repository');
const moment = require('moment-timezone');

const clanTypeTranslations = {
    "open": "Aberto",
    "inviteOnly": "Somente por Convite",
    "closed": "Fechado"
};

const memberRoleTranslations = {
    "member": "Membro",
    "elder": "Ancião",
    "coLeader": "Co-Líder",
    "leader": "Líder"
};

const warFrequencyTranslations = {
    "always": "Sempre",
    "moreThanOncePerWeek": "Mais de uma vez por semana",
    "oncePerWeek": "Uma vez por semana",
    "lessThanOncePerWeek": "Menos de uma vez por semana",
    "never": "Nunca",
    "unknown": "Desconhecida"
};

const leagueTranslations = {
    "Unranked": "Sem Liga",
    "Bronze League I": "Liga Bronze I",
    "Bronze League II": "Liga Bronze II",
    "Bronze League III": "Liga Bronze III",
    "Silver League I": "Liga Prata I",
    "Silver League II": "Liga Prata II",
    "Silver League III": "Liga Prata III",
    "Gold League I": "Liga Ouro I",
    "Gold League II": "Liga Ouro II",
    "Gold League III": "Liga Ouro III",
    "Crystal League I": "Liga Cristal I",
    "Crystal League II": "Liga Cristal II",
    "Crystal League III": "Liga Cristal III",
    "Master League I": "Liga Mestre I",
    "Master League II": "Liga Mestre II",
    "Master League III": "Liga Mestre III",
    "Champion League I": "Liga Campeão I",
    "Champion League II": "Liga Campeão II",
    "Champion League III": "Liga Campeão III",
    "Titan League I": "Liga Titã I",
    "Titan League II": "Liga Titã II",
    "Titan League III": "Liga Titã III",
    "Legend League": "Liga Lenda",
    "Stone League I": "Liga Pedra I",
    "Stone League II": "Liga Pedra II",
    "Stone League III": "Liga Pedra III",
    "Copper League I": "Liga Cobre I",
    "Copper League II": "Liga Cobre II",
    "Copper League III": "Liga Cobre III",
    "Copper League IV": "Liga Cobre IV"
};

const locationTranslations = {
    "Brazil": "Brasil"
};

const chatLanguageTranslations = {
    "Portuguese": "Português"
};

function translateClanType(type) {
    return clanTypeTranslations[type] || type;
}

function translateMemberRole(role) {
    return memberRoleTranslations[role] || role;
}

function translateWarFrequency(frequency) {
    return warFrequencyTranslations[frequency] || frequency;
}

function translateLeague(leagueName) {
    return leagueTranslations[leagueName] || leagueName;
}

function translateLocation(locationName) {
    return locationTranslations[locationName] || locationName;
}

function translateChatLanguage(languageName) {
    return chatLanguageTranslations[languageName] || languageName;
}

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

const formatClanInfo = (clanInfo, userName) => {
    const translatedType = translateClanType(clanInfo.type);
    const translatedFrequency = translateWarFrequency(clanInfo.warFrequency);
    const translatedLocation = translateLocation(clanInfo.location?.name);
    const translatedChatLanguage = translateChatLanguage(clanInfo.chatLanguage?.name);

    return [
        `### Informações do Clã (Solicitado por: *${userName}*)\n`,
        `*Nome do Clã*: _${clanInfo.name || "Não disponível"}_`,
        `*Tag do Clã*: ${clanInfo.tag || "Não disponível"}`,
        `*Nível do Clã*: _${clanInfo.clanLevel ?? "Não disponível"}_`,
        `*Tipo de Clã*: _${translatedType ?? "Não disponível"}_`,
        `*Número de Membros*: _${clanInfo.members ?? "Não disponível"}_`,
        `*Descrição*: _${clanInfo.description ?? "Não disponível"}_`,
        `*Localização*: _${translatedLocation ?? "Não disponível"}_`,
        `*Troféus do Clã*: _${clanInfo.clanBuilderBasePoints ?? "Não disponível"}_`,
        `*Liga do Clã*: _${clanInfo.warLeague?.name ?? "Não disponível"}_`,
        `*Número de Vitórias*: _${clanInfo.warWins ?? "Não disponível"}_`,
        `*Número de Vitórias Consecutivas*: _${clanInfo.warWinStreak ?? "Não disponível"}_`,
        `*Número de Derrotas*: _${clanInfo.warLosses ?? "Não disponível"}_`,
        `*Número de Empates*: _${clanInfo.warTies ?? "Não disponível"}_`,
        `*Frequência de Guerras*: _${translatedFrequency ?? "Não disponível"}_`,
        `*Requerimento de Castelo*: _${clanInfo.requiredTownhallLevel ?? "Não disponível"}_`,
        `*Requerimento Troféus de Base do Construtor*: _${clanInfo.requiredBuilderBaseTrophies ?? "Não disponível"}_`,
        `*Nível de Capital do Clã*: _${clanInfo.clanCapital?.capitalHallLevel ?? "Não disponível"}_`,
        `*Linguagem do chat*: _${translatedChatLanguage ?? "Não disponível"}_ \n\n`
    ].join("\n");
};

const formatMemberList = (memberList) => {
    if (!memberList || memberList.length === 0) {
        return "Nenhum membro encontrado ou a lista está vazia.";
    }

    memberList.sort((a, b) => a.clanRank - b.clanRank);

    const members = memberList;
    const chunkSize = 10;
    let currentChunk = 0;
    let messages = [];

    while (currentChunk < members.length) {
        const chunk = members.slice(currentChunk, currentChunk + chunkSize);
        let membersMessage = "### Membros do Clã ###\n\n";

        chunk.forEach(member => {
            const translatedRole = translateMemberRole(member.role);
            const translatedLeague = translateLeague(member.league?.name);
            const translatedBuilderBaseLeague = translateLeague(member.builderBaseLeague?.name);

            membersMessage += [
                `*Tag*: ${member.tag}`,
                `*Nome*: _${member.name}_`,
                `*Cargo*: _${translatedRole}_`,
                `*Nível do Centro de Vila*: _${member.townHallLevel}_`,
                `*Troféus*: _${member.trophies}_`,
                `*Doações Realizadas*: _${member.donations}_`,
                `*Doações Recebidas*: _${member.donationsReceived}_`,
                `*Nível do Jogador*: _${member.expLevel}_`,
                `*Liga*: _${translatedLeague ?? "Não disponível"}_`,
                `*Posição no Clã*: _${member.clanRank}_`,
                `*Posição Anterior no Clã*: _${member.previousClanRank}_`,
                `*Troféus Base do Construtor*: _${member.builderBaseTrophies}_`,
                `*Liga da Base do Construtor*: _${translatedBuilderBaseLeague ?? "Não disponível"}_ \n\n`
            ].join("\n");
        });
        messages.push(membersMessage);
        currentChunk += chunkSize;
    }
    return messages;
};

const handleClanCommand = async (ctx) => {
    try {
        await logMessage(ctx);

        const message = ctx.message.text.trim();
        const clanTag = message.match(/#\w+/);
        const userName = ctx.from.username || `${ctx.from.first_name}`;

        if (!clanTag || !clanTag[0]) {
            const welcomeMessage = [
                `*Comando /clan selecionado*\n`,
                "Este comando fornece informações detalhadas sobre um clã, como sua tag, nome, status, localização e mais.",
                "Para usá-lo, basta escrever */clan <TagDoClã>*"
            ].join("\n");
            await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
            return;
        }

        const tag = clanTag[0];
        const clanInfo = await getClanInfo(tag);

        if (!clanInfo) {
            await ctx.reply(`*${userName}* - Clã não encontrado ou tag inválida.`, { parse_mode: "Markdown" });
            return;
        }

        if (clanInfo.error) {
            await ctx.reply(`⚠️ *${userName}*, Servidor está em manutenção no momento. Tente novamente mais tarde.`, { parse_mode: "Markdown" });
            return;
        }

        const clanMessage = formatClanInfo(clanInfo, userName);
        await ctx.reply(clanMessage, { parse_mode: "Markdown" });

        const memberMessages = formatMemberList(clanInfo.memberList);
        for (const message of memberMessages) {
            await ctx.reply(message, { parse_mode: "Markdown" });
        }

    } catch (error) {
        console.error("Erro no comando /clan:", error);
        await ctx.reply("Ocorreu um erro ao processar o comando. Tente novamente mais tarde.", { parse_mode: "Markdown" });
    }
};

module.exports = { handleClanCommand };