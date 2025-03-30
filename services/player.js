const { getPlayerInfo } = require('../repositories/repository');
const moment = require('moment-timezone');

const memberRoleTranslations = {
    "member": "Membro",
    "elder": "Ancião",
    "coLeader": "Co-Líder",
    "leader": "Líder"
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

const warPreferenceTranslations = {
    "in": "Participando",
    "out": "Não Participando"
};

const troopTranslations = {
    "Barbarian": "Bárbaro",
    "Archer": "Arqueira",
    "Giant": "Gigante",
    "Goblin": "Goblin",
    "Wall Breaker": "Quebra-Muros",
    "Balloon": "Balão",
    "Wizard": "Mago",
    "Healer": "Curadora",
    "Dragon": "Dragão",
    "P.E.K.K.A": "P.E.K.K.A",
    "Baby Dragon": "Dragão Bebê",
    "Miner": "Mineiro",
    "Electro Dragon": "Dragão Elétrico",
    "Yeti": "Yeti",
    "Dragon Rider": "Cavaleiro de Dragão",
    "Minion": "Servo",
    "Hog Rider": "Corredor",
    "Valkyrie": "Valquíria",
    "Golem": "Golem",
    "Witch": "Bruxa",
    "Lava Hound": "Sabujo de Lava",
    "Bowler": "Arremessador",
    "Ice Golem": "Golem de Gelo",
    "Headhunter": "Caçadora de Cabeças",
    "Battle Ram": "Aríete de Batalha",
    "Electro Titan": "Titã Elétrico",
    "Root Rider": "Cavaleira da Raiz",
    "Bomber": "Bombardeiro",
    "Super Barbarian": "Super Bárbaro",
    "Super Archer": "Super Arqueira",
    "Super Giant": "Super Gigante",
    "Sneaky Goblin": "Goblin Sorrateiro",
    "Wall Wrecker": "Destruidor de Muros",
    "Super Wizard": "Super Mago",
    "Inferno Dragon": "Dragão Infernal",
    "Super P.E.K.K.A": "Super P.E.K.K.A",
    "Super Minion": "Super Servo",
    "Super Valkyrie": "Super Valquíria",
    "Super Witch": "Super Bruxa",
    "Ice Hound": "Sabujo de Gelo",
    "Ballon": "Balão",
    "Super Dragon": "Super Dragão",
    "Golemite": "Golemita",
    "Stone Golem": "Golem de Pedra",
    "Flying Fortress": "Fortaleza Voadora",
    "Raged Barbarian": "Bárbaro Enfurecido",
    "Queen Archer": "Arqueira Rainha",
    "Giant Cannon Cart": "Carrinho de Canhão Gigante",
    "Night Witch": "Bruxa da Noite",
    "Night Bomber": "Bombardeiro Noturno",
    "Drop Ship": "Navio de Soltar",
    "Super P.E.K.K.A.": "Super P.E.K.K.A.",
    "Hog Glider": "Planador de Porco",
    "Battle Blimp": "Dirigível de Batalha",
    "Siege Barracks": "Quartel de Cerco",
    "Log Launcher": "Lançador de Toras",
    "Stone Slammer": "Aríete de Pedra",
    "Wall Wrecker": "Destruidor de Muros",
    "Lava Launcher": "Lançador de Lava",
    "Flying Machine": "Máquina Voadora",
    "Rocker Balloon": "Balão Fogueteiro",
    "Cannon Cart": "Carrinho de Canhão",
    "Baby Dragon": "Dragão Bebê",
    "Electro Owl": "Coruja Elétrica",
    "Phoenix": "Fênix"
};

const achievementTranslations = {
    "Bigger Coffers": "Cofres Maiores",
    "Get those Goblins!": "Pegue aqueles Goblins!",
    "Bigger & Better": "Maior e Melhor",
    "Nice and Tidy": "Bom e Limpo",
    "Discover New Troops": "Descubra Novas Tropas",
    "Gold Grab": "Pegada de Ouro",
    "Elixir Escapade": "Escapada de Elixir",
    "Sweet Victory!": "Doce Vitória!",
    "Empire Builder": "Construtor de Impérios",
    "Wall Buster": "Destruidor de Muros",
    "Humiliator": "Humilhador",
    "Union Buster": "Destruidor de Sindicatos",
    "Conqueror": "Conquistador",
    "Unbreakable": "Inquebrável",
    "Friend in Need": "Amigo Necessitado",
    "Mortar Mauler": "Destruidor de Morteiros",
    "Heroic Heist": "Roubo Heróico",
    "League All-Star": "Estrela da Liga",
    "X-Bow Exterminator": "Exterminador de Bestas X",
    "Firefighter": "Bombeiro",
    "War Hero": "Herói de Guerra",
    "Clan War Wealth": "Riqueza da Guerra de Clãs",
    "Anti-Artillery": "Anti-Artilharia",
    "Sharing is caring": "Compartilhar é se importar",
    "Keep Your Account Safe!": "Mantenha sua conta segura!",
    "Master Engineering": "Engenharia Master",
    "Next Generation Model": "Modelo de Próxima Geração",
    "Un-Build It": "Desconstrua Isso",
    "Champion Builder": "Construtor Campeão",
    "High Gear": "Marcha Pesada",
    "Hidden Treasures": "Tesouros Escondidos",
    "Games Champion": "Campeão dos Jogos",
    "Dragon Slayer": "Matador de Dragões",
    "War League Legend": "Lenda da Liga de Guerra",
    "Well Seasoned": "Bem Temperado",
    "Shattered and Scattered": "Estilhaçado e Espalhado",
    "Not So Easy This Time": "Não tão fácil desta vez",
    "Bust This!": "Destrua Isso!",
    "Superb Work": "Trabalho Soberbo",
    "Siege Sharer": "Compartilhador de Cerco",
    "Aggressive Capitalism": "Capitalismo Agressivo",
    "Most Valuable Clanmate": "Membro de Clã Mais Valioso",
    "Counterspell": "Contra-feitiço",
    "Monolith Masher": "Destruidor de Monólitos",
    "Ungrateful Child": "Criança Ingrata",
    "Supercharger": "Supercarregador",
    "Multi-Archer Tower Terminator": "Exterminador de Torre Arqueira Múltipla",
    "Ricochet Cannon Crusher": "Destruidor de Canhão de Ricochete",
    "Firespitter Finisher": "Finalizador de Cuspidor de Fogo",
    "Multi-Gear Tower Trampler": "Atropelador de Torre de Engrenagem Múltipla",
    "Perfect War": "Guerra Perfeita",
    "Conqueror": "Conquistador",
    "Unbreakable": "Inquebrável",
    "Champion War Leaguer": "Campeão da Liga de Guerra",
    "Legendary League": "Liga Lendária"
};

const heroEquipmentTranslations = {
    "Barbarian Puppet": "Boneco Bárbaro",
    "Rage Vial": "Frasco de Fúria",
    "Earthquake Boots": "Botas Terremoto",
    "Vampstache": "Vampi-bigode",
    "Archer Puppet": "Boneco Arqueira",
    "Invisibility Vial": "Frasco de Invisibilidade",
    "Giant Arrow": "Flecha Gigante",
    "Healer Puppet": "Boneco Curadora",
    "Henchmen Puppet": "Marionete de Capanga",
    "Eternal Tome": "Tomo Eterno",
    "Life Gem": "Gema da Vida",
    "Healing Tome": "Tomo de Cura",
    "Lava Launcher Puppet": "Boneco de Lavalão",
    "Heroic Gauntlet": "Tocha Heroica",
    "Runner Puppet": "Boneco de Corredor",
    "Electro Boots": "Par de Botas Elétricas",
    "Haste Vial": "Frasco de Aceleração",
    "Ophidian Bracelets": "Bracelete Ofídico",
    "Magic Mirror": "Espelho Mágico",
    "Rage Gem": "Gema de Fúria",
    "Royal Gem": "Gema Real",
    "Seeking Shield": "Escudo Escaldante",
    "Gauntlet": "Manopla",
    "Giant Gauntlet": "Manopla Gigante",
    "Spiky Ball": "Bola Espinhosa",
    "Metal Pants": "Calça de Metal",
    "Dark Orb": "Orb Sombrio",
};

const spellTranslations = {
    "Lightning Spell": "Feitiço de Relâmpago",
    "Healing Spell": "Feitiço de Cura",
    "Rage Spell": "Feitiço de Fúria",
    "Jump Spell": "Feitiço de Salto",
    "Freeze Spell": "Feitiço de Gelo",
    "Poison Spell": "Feitiço de Veneno",
    "Earthquake Spell": "Feitiço de Terremoto",
    "Haste Spell": "Feitiço de Aceleração",
    "Skeleton Spell": "Feitiço de Esqueleto",
    "Clone Spell": "Feitiço de Clone",
    "Bat Spell": "Feitiço de Morcego",
    "Invisibility Spell": "Feitiço de Invisibilidade",
    "Rocket Balloon Spell": "Feitiço de Balão Fogueteiro",
    "Recall Spell": "Feitiço de RecRecall"
};

const heroTranslations = {
    "Barbarian King": "Rei Bárbaro",
    "Archer Queen": "Rainha Arqueira",
    "Battle Machine": "Máquina de Batalha",
    "Grand Warden": "Grande Guardião",
    "Royal Champion": "Campeã Real",
    "Minion Prince": "Príncipe Servo",
    "Party Warden": "Guardião da Festa"
};

const labelTranslations = {
    "Newbie": "Novato",
    "Clan Wars": "Guerras de Clãs",
    "Clan War League": "Liga de Guerras de Clãs",
    "Trophy Pushing": "Empurrando Troféus",
    "Active": "Ativo",
    "Active Daily": "Ativo",
    "Veteran": "Veterano",
    "Friendly": "Amigável",
    "Competitive": "Competitivo",
    "Donator": "Doador",
    "Teacher": "Professor",
    "Leader": "Líder",
    "Builder": "Construtor",
    "Attacker": "Atacante",
    "Defender": "Defensor",
    "Strategist": "Estrategista",
    "Collector": "Coletor",
    "Social": "Social",
    "Dedicated": "Dedicado",
    "Helper": "Ajudante",
    "Loyal": "Leal",
    "Tactician": "Tático",
    "Base Designing": "Design de Base",
    "Active Donator": "Doador Ativo",
    "Amateur Attacker": "Atacante Amador",
    "Raid Master": "Mestre de Raides",
    "War Specialist": "Especialista em Guerras"
};

function translateTroopName(troopName) {
    return troopTranslations[troopName] || troopName;
}

function translateAchievementName(achievementName) {
    return achievementTranslations[achievementName] || achievementName;
}

function translateHeroEquipmentName(equipmentName) {
    return heroEquipmentTranslations[equipmentName] || equipmentName;
}

function translateSpellName(spellName) {
    return spellTranslations[spellName] || spellName;
}

function translateHeroName(heroName) {
    return heroTranslations[heroName] || heroName;
}

function translateLabelName(labelName) {
    return labelTranslations[labelName] || labelName;
}

function translateLeagueName(leagueName) {
    return leagueTranslations[leagueName] || leagueName;
}

function translateMemberRole(role) {
    return memberRoleTranslations[role] || role;
}

function translateWarPreference(preference) {
    return warPreferenceTranslations[preference] || preference;
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

const handlePlayerCommand = async (ctx) => {
    try {
        await logMessage(ctx);

        const message = ctx.message.text.trim();
        const playerTag = message.match(/#\w+/);
        const userName = ctx.from.username || `${ctx.from.first_name}`;

        if (playerTag && playerTag[0]) {
            const tag = playerTag[0];

            const playerInfo = await getPlayerInfo(tag);

            if (playerInfo?.error) {
                await ctx.reply(`⚠️ *${userName}*, Servidor está em manutenção no momento. Tente novamente mais tarde.`, {
                    parse_mode: "Markdown"
                });
                return;
            }

            if (playerInfo) {
                const formatPlayerData = (player, title) => {
                    if (!player) return `*${title}*: _Não disponível_`;
                    let formattedString = `*${title}*\n`;
                    formattedString += `*Tag*: _${player.tag ?? "Não disponível"}_ \n`;
                    formattedString += `*Nome*: _${player.name ?? "Não disponível"}_ \n`;
                    formattedString += `*Nível da Castelo*: _${player.townHallLevel ?? "Não disponível"}_ \n`;
                    formattedString += `*Nível de Experiência*: _${player.expLevel ?? "Não disponível"}_ \n`;
                    formattedString += `*Troféus*: _${player.trophies ?? "Não disponível"}_ \n`;

                    if (player.league) {
                        const translatedLeagueName = translateLeagueName(player.league.name);
                        formattedString += `*Liga*: _${translatedLeagueName ?? "Não disponível"}_ \n`;
                    }

                    formattedString += `*Melhores Troféus*: _${player.bestTrophies ?? "Não disponível"}_ \n`;
                    formattedString += `*Estrelas de Guerra*: _${player.warStars ?? "Não disponível"}_ \n`;
                    formattedString += `*Vitórias em Ataques*: _${player.attackWins ?? "Não disponível"}_ \n`;
                    formattedString += `*Vitórias em Defesas*: _${player.defenseWins ?? "Não disponível"}_ \n`;
                    formattedString += `*Nível da Base do Construtor*: _${player.builderHallLevel ?? "Não disponível"}_ \n`;
                    formattedString += `*Troféus da Base do Construtor*: _${player.builderBaseTrophies ?? "Não disponível"}_ \n`;
                    formattedString += `*Melhores Troféus da Base do Construtor*: _${player.bestBuilderBaseTrophies ?? "Não disponível"}_ \n`;

                    if (player.builderBaseLeague) {
                        const translatedBuilderBaseLeagueName = translateLeagueName(player.builderBaseLeague.name);
                        formattedString += `*Liga da Base do Construtor*: _${translatedBuilderBaseLeagueName ?? "Não disponível"}_ \n`;
                    }

                    const translatedRole = translateMemberRole(player.role);
                    formattedString += `*Cargo*: _${translatedRole ?? "Não disponível"}_ \n`;

                    const translatedWarPreference = translateWarPreference(player.warPreference);
                    formattedString += `*Preferência de Guerra*: _${translatedWarPreference ?? "Não disponível"}_ \n`;

                    formattedString += `*Doações*: _${player.donations ?? "Não disponível"}_ \n`;
                    formattedString += `*Doações Recebidas*: _${player.donationsReceived ?? "Não disponível"}_ \n`;
                    formattedString += `*Contribuições da Capital do Clã*: _${player.clanCapitalContributions ?? "Não disponível"}_ \n`;

                    if (player.clan) {
                        formattedString += `\n*### Clã ###* \n`;
                        formattedString += `*Tag do Clan*: _${player.clan.tag ?? "Não disponível"}_ \n`;
                        formattedString += `*Nome do Clan*: _${player.clan.name ?? "Não disponível"}_ \n`;
                        formattedString += `*Nível do Clã*: _${player.clan.clanLevel ?? "Não disponível"}_ \n`;
                    } else {
                        formattedString += `\n*### Clã ###* \n`;
                        formattedString += `_Não pertence a nenhum clã_\n`;
                    }

                    if (player.labels && player.labels.length > 0) {
                        formattedString += `\n*### Etiquetas ###* \n`;
                        player.labels.forEach((label, index) => {
                            const translatedName = translateLabelName(label.name);
                            formattedString += `*Etiqueta ${index + 1}*: _${translatedName ?? "Não disponível"}_ \n`;
                        });
                    }

                    return formattedString;
                };

                await ctx.reply(formatPlayerData(playerInfo, `# Informações do Jogador (Solicitado por: *${userName}*)\n`), { parse_mode: "Markdown" });

                if (playerInfo.spells?.length) {
                    let spellsMessage = "*### Feitiços ###*\n\n";
                    playerInfo.spells.forEach(spell => {
                        const translatedName = translateSpellName(spell.name);
                        spellsMessage += `*${translatedName}* - *Nível*: _${spell.level ?? "Não disponível"}_ (Máx: _${spell.maxLevel ?? "Não disponível"}_)\n`;
                    });
                    await ctx.reply(spellsMessage, { parse_mode: "Markdown" });
                } else {
                    await ctx.reply("Nenhum feitiço disponível.", { parse_mode: "Markdown" });
                }

                if (playerInfo.heroes?.length) {
                    let heroesMessage = "*### Heróis ###*\n\n";
                    playerInfo.heroes.forEach(hero => {
                        const translatedName = translateHeroName(hero.name);
                        heroesMessage += `*${translatedName}* - *Nível*: _${hero.level ?? "Não disponível"}_ (Máx: _${hero.maxLevel ?? "Não disponível"}_)\n`;
                    });
                    await ctx.reply(heroesMessage, { parse_mode: "Markdown" });
                } else {
                    await ctx.reply("Nenhum herói disponível.", { parse_mode: "Markdown" });
                }

                if (playerInfo.heroEquipment?.length) {
                    let heroEquipmentsMessage = "*### Equipamentos de Herói ###*\n\n";
                    playerInfo.heroEquipment.forEach(equipment => {
                        const translatedName = translateHeroEquipmentName(equipment.name);
                        heroEquipmentsMessage += `*${translatedName}* - *Nível*: _${equipment.level ?? "Não disponível"}_ (Máx: _${equipment.maxLevel ?? "Não disponível"}_)\n`;
                    });
                    await ctx.reply(heroEquipmentsMessage, { parse_mode: "Markdown" });
                } else {
                    await ctx.reply("Nenhum equipamento de herói disponível.", { parse_mode: "Markdown" });
                }

                if (playerInfo.troops?.length) {
                    let troopsMessage = "*### Tropas ###*\n\n";
                    playerInfo.troops.forEach(troop => {
                        const translatedName = translateTroopName(troop.name);
                        troopsMessage += `*${translatedName}* - *Nível*: _${troop.level ?? "Não disponível"}_ (Máx: _${troop.maxLevel ?? "Não disponível"}_)\n`;
                    });
                    await ctx.reply(troopsMessage, { parse_mode: "Markdown" });
                } else {
                    await ctx.reply("Nenhuma tropa disponível.", { parse_mode: "Markdown" });
                }

                if (playerInfo.achievements?.length) {
                    let achievementsMessage = "*### Conquistas ###*\n\n";
                    playerInfo.achievements.forEach(achievement => {
                        const translatedName = translateAchievementName(achievement.name);
                        achievementsMessage += `*${translatedName}*: _${achievement.stars ?? "Não disponível"}_ estrela(s)\n`;
                    });
                    await ctx.reply(achievementsMessage, { parse_mode: "Markdown" });
                } else {
                    await ctx.reply("Nenhuma conquista disponível.", { parse_mode: "Markdown" });
                }

            } else {
                await ctx.reply(`*${userName}* - Jogador não encontrado ou tag inválida.`, { parse_mode: "Markdown" });
            }
        } else {
            const welcomeMessage = [
                `*Comando /jogador selecionado*\n`,
                "Este comando fornece informações detalhadas sobre um jogador, como sua tag, nível, troféus, clã e mais.",
                "Para usá-lo, basta escrever */jogador <TagDoJogador>*"
            ].join("\n");

            await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
        }
    } catch (err) {
        console.error("Erro no comando /player:", err);
        await ctx.reply("Ocorreu um erro ao processar o comando. Tente novamente mais tarde.", { parse_mode: "Markdown" });
    }
};

module.exports = { handlePlayerCommand };