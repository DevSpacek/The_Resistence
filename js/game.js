// Game state and character definitions
const GameManager = {
    // Character definitions
    characters: {
        // Resistance characters
        comandante: {
            name: 'Comandante',
            displayName: '👑 Comandante',
            faction: 'resistance',
            isSpecial: true,
            knowsSpies: true,
            knowsBlindSpy: true, // SEMPRE conhece o Espião Cego (regra oficial)
            description: 'Você é o líder da Resistência e conhece TODOS os espiões (incluindo o Espião Cego)!'
        },
        guardacostas: {
            name: 'Guarda-Costas',
            displayName: '🛡️ Guarda-Costas',
            faction: 'resistance',
            isSpecial: true,
            knowsCommander: true,
            description: 'Você sabe quem é o Comandante e deve protegê-lo.'
        },
        desertorResistencia: {
            name: 'Desertor',
            displayName: '🔄 Desertor',
            faction: 'resistance',
            isSpecial: true,
            isDesertor: true,
            description: 'Você está na Resistência, mas pode trocar de lado durante o jogo. Use o Baralho de Troca de Lealdade.'
        },
        // Spy characters
        assassino: {
            name: 'Assassino',
            displayName: '🗡️ Assassino',
            faction: 'spy',
            isSpecial: true,
            knowsSpies: true,
            visibleToCommander: true,
            description: 'Você deve identificar e eliminar o Comandante para vencer! Se a Resistência vencer 3 missões, você tem uma chance de matá-lo.'
        },
        espiaocego: {
            name: 'Espião Cego',
            displayName: '👁️ Espião Cego',
            faction: 'spy',
            isSpecial: true,
            isBlind: true,
            visibleToCommander: true, // SEMPRE visível ao Comandante (regra oficial)
            description: 'Você não conhece os outros espiões e eles não conhecem você, MAS o Comandante sabe quem você é.'
        },
        agenteinvisivel: {
            name: 'Agente Invisível',
            displayName: '👻 Agente Invisível',
            faction: 'spy',
            isSpecial: true,
            knowsSpies: true,
            visibleToCommander: false, // Invisível ao Comandante (regra oficial)
            description: 'Você conhece os outros espiões, mas é INVISÍVEL ao Comandante!'
        },
        comandantefalso: {
            name: 'Comandante Falso',
            displayName: '👹 Comandante Falso',
            faction: 'spy',
            isSpecial: true,
            isFalseCommander: true,
            knowsSpies: false, // Padrão: não conhece (pode ser alterado por opção)
            visibleToCommander: true,
            description: 'Você se revela ao Guarda-Costas como se fosse o Comandante!'
        },
        desertorEspiao: {
            name: 'Desertor',
            displayName: '🔄 Desertor',
            faction: 'spy',
            isSpecial: true,
            isDesertor: true,
            knowsSpies: true,
            visibleToCommander: true,
            thumbsUp: true, // Estende polegar ao invés de abrir olhos
            description: 'Você é um espião desertor. Durante a revelação, estenda seu polegar ao invés de abrir os olhos.'
        }
    },

    // Get spy count based on player count
    getSpyCount(playerCount) {
        if (playerCount <= 6) return 2;
        if (playerCount <= 8) return 3;
        return 4;
    },

    // Distribute roles to players
    distributeRoles(playerCount, selectedSpecials, options, playerNames) {
        const spyCount = this.getSpyCount(playerCount);
        const resistanceCount = playerCount - spyCount;
        
        const roles = [];
        let specialsUsed = {
            resistance: [],
            spy: []
        };

        // Process selected special characters
        selectedSpecials.forEach(specialKey => {
            if (specialKey === 'comandantefalso') {
                const char = { ...this.characters.comandantefalso };
                char.knowsSpies = options.comandanteFalsoKnows;
                if (!options.comandanteFalsoKnows) {
                    char.description = 'Você se revela ao Guarda-Costas como Comandante, mas NÃO conhece os outros espiões.';
                } else {
                    char.description = 'Você se revela ao Guarda-Costas como Comandante e conhece os outros espiões (variante).';
                }
                specialsUsed.spy.push({
                    ...char,
                    key: specialKey
                });
            } else if (specialKey === 'desertor') {
                // Add both desertor types
                const desertorRes = { ...this.characters.desertorResistencia };
                const desertorSpy = { ...this.characters.desertorEspiao };
                
                // Se desertores se conhecem
                if (options.desertoresKnowEachOther) {
                    desertorRes.knowsOtherDesertor = true;
                    desertorSpy.knowsOtherDesertor = true;
                    desertorRes.description += ' Você conhece o outro Desertor.';
                    desertorSpy.description += ' Você conhece o outro Desertor.';
                }
                
                specialsUsed.resistance.push({
                    ...desertorRes,
                    key: 'desertorResistencia'
                });
                specialsUsed.spy.push({
                    ...desertorSpy,
                    key: 'desertorEspiao'
                });
            } else {
                const char = this.characters[specialKey];
                specialsUsed[char.faction].push({
                    ...char,
                    key: specialKey
                });
            }
        });

        // Add special resistance roles
        specialsUsed.resistance.forEach(char => {
            roles.push({
                ...char,
                faction: 'resistance'
            });
        });

        // Add special spy roles
        specialsUsed.spy.forEach(char => {
            roles.push({
                ...char,
                faction: 'spy'
            });
        });

        // Fill remaining resistance slots
        const remainingResistance = resistanceCount - specialsUsed.resistance.length;
        for (let i = 0; i < remainingResistance; i++) {
            roles.push({
                name: 'Membro da Resistência',
                displayName: '🎭 Membro da Resistência',
                faction: 'resistance',
                isSpecial: false,
                description: 'Você é um membro leal da Resistência.'
            });
        }

        // Fill remaining spy slots
        const remainingSpies = spyCount - specialsUsed.spy.length;
        for (let i = 0; i < remainingSpies; i++) {
            roles.push({
                name: 'Espião',
                displayName: '🕵️ Espião',
                faction: 'spy',
                isSpecial: false,
                knowsSpies: true,
                visibleToCommander: true,
                description: 'Você é um espião infiltrado na Resistência.'
            });
        }

        // Shuffle roles
        const shuffledRoles = this.shuffleArray(roles);
        
        // Assign player names and find desertores
        let desertorIndices = [];
        shuffledRoles.forEach((role, index) => {
            role.playerName = playerNames[index] || `Jogador ${index + 1}`;
            role.playerIndex = index;
            
            // Track desertores
            if (role.isDesertor) {
                desertorIndices.push(index);
            }
        });

        // If desertores know each other, add the info
        if (options.desertoresKnowEachOther && desertorIndices.length === 2) {
            shuffledRoles[desertorIndices[0]].otherDesertorIndex = desertorIndices[1];
            shuffledRoles[desertorIndices[1]].otherDesertorIndex = desertorIndices[0];
        }

        return shuffledRoles;
    },

    // Fisher-Yates shuffle
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Get spy information for a player
    getSpyInfo(roles, currentPlayerIndex) {
        const spies = [];
        roles.forEach((role, index) => {
            if (role.faction === 'spy' && !role.isBlind) {
                spies.push({
                    index: index,
                    name: role.displayName,
                    playerName: role.playerName,
                    playerNum: index + 1,
                    visibleToCommander: role.visibleToCommander !== false,
                    thumbsUp: role.thumbsUp || false
                });
            }
        });
        return spies;
    },

    // Get ALL spies including blind spy (for Comandante only)
    getAllSpiesForCommander(roles) {
        const spies = [];
        roles.forEach((role, index) => {
            if (role.faction === 'spy') {
                // Comandante vê TODOS exceto os invisíveis
                if (role.visibleToCommander !== false) {
                    spies.push({
                        index: index,
                        name: role.displayName,
                        playerName: role.playerName,
                        playerNum: index + 1,
                        isBlind: role.isBlind || false
                    });
                }
            }
        });
        return spies;
    },

    // Get commander information (for Guarda-Costas)
    getCommanderInfo(roles) {
        const commanders = [];
        roles.forEach((role, index) => {
            if (role.key === 'comandante' || role.key === 'comandantefalso') {
                commanders.push({
                    index: index,
                    name: role.displayName,
                    playerName: role.playerName,
                    playerNum: index + 1,
                    isReal: role.key === 'comandante'
                });
            }
        });
        return commanders;
    },

    // Save game state
    saveGame(playerCount, roles, playerNames) {
        const gameState = {
            playerCount: playerCount,
            roles: roles,
            playerNames: playerNames,
            currentPlayer: 0,
            timestamp: Date.now()
        };
        localStorage.setItem('resistanceGame', JSON.stringify(gameState));
    },

    // Load game state
    loadGame() {
        const saved = localStorage.getItem('resistanceGame');
        return saved ? JSON.parse(saved) : null;
    },

    // Clear game state
    clearGame() {
        localStorage.removeItem('resistanceGame');
    }
};