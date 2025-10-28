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
            description: 'Você é o líder da Resistência e conhece todos os espiões!'
        },
        guardacostas: {
            name: 'Guarda-Costas',
            displayName: '🛡️ Guarda-Costas',
            faction: 'resistance',
            isSpecial: true,
            description: 'Você protege o Comandante da Resistência.'
        },
        desertorResistencia: {
            name: 'Desertor',
            displayName: '🔄 Desertor',
            faction: 'resistance',
            isSpecial: true,
            isDesertor: true,
            description: 'Você está na Resistência, mas pode trocar de lado durante o jogo.'
        },
        // Spy characters
        assassino: {
            name: 'Assassino',
            displayName: '🗡️ Assassino',
            faction: 'spy',
            isSpecial: true,
            knowsSpies: true,
            description: 'Você deve identificar e eliminar o Comandante para vencer!'
        },
        espiaocego: {
            name: 'Espião Cego',
            displayName: '👁️ Espião Cego',
            faction: 'spy',
            isSpecial: true,
            isBlind: true,
            description: 'Você é um espião, mas não conhece os outros espiões (e eles não conhecem você).'
        },
        comandantefalso: {
            name: 'Comandante Falso',
            displayName: '👹 Comandante Falso',
            faction: 'spy',
            isSpecial: true,
            isFalseCommander: true,
            knowsSpies: false, // Will be set based on user choice
            description: 'Você parece ser o Comandante, mas é um espião!'
        },
        desertorEspiao: {
            name: 'Desertor',
            displayName: '🔄 Desertor',
            faction: 'spy',
            isSpecial: true,
            isDesertor: true,
            knowsSpies: true,
            description: 'Você é um espião, mas pode trocar de lado durante o jogo.'
        }
    },

    // Get spy count based on player count
    getSpyCount(playerCount) {
        if (playerCount <= 6) return 2;
        if (playerCount <= 8) return 3;
        return 4;
    },

    // Distribute roles to players
    distributeRoles(playerCount, selectedSpecials, comandanteFalsoKnows, playerNames) {
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
                char.knowsSpies = comandanteFalsoKnows;
                if (!comandanteFalsoKnows) {
                    char.description = 'Você parece ser o Comandante, mas é um espião! Não conhece os outros espiões.';
                } else {
                    char.description = 'Você parece ser o Comandante, mas é um espião! Você conhece os outros espiões.';
                }
                specialsUsed.spy.push({
                    ...char,
                    key: specialKey
                });
            } else if (specialKey === 'desertor') {
                // Add both desertor types
                specialsUsed.resistance.push({
                    ...this.characters.desertorResistencia,
                    key: 'desertorResistencia'
                });
                specialsUsed.spy.push({
                    ...this.characters.desertorEspiao,
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
                description: 'Você é um espião infiltrado na Resistência.'
            });
        }

        // Shuffle roles
        const shuffledRoles = this.shuffleArray(roles);
        
        // Assign player names
        shuffledRoles.forEach((role, index) => {
            role.playerName = playerNames[index] || `Jogador ${index + 1}`;
            role.playerIndex = index;
        });

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
                    playerNum: index + 1
                });
            }
        });
        return spies;
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