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
            description: 'Você parece ser o Comandante, mas é um espião! Não conhece os outros espiões.'
        },
        // Neutral (can be either faction)
        inquisidor: {
            name: 'Inquisidor',
            displayName: '⚖️ Inquisidor',
            faction: null, // Will be assigned
            isSpecial: true,
            description: 'Você pode verificar a lealdade de um jogador durante o jogo.'
        }
    },

    // Get spy count based on player count
    getSpyCount(playerCount) {
        if (playerCount <= 6) return 2;
        if (playerCount <= 8) return 3;
        return 4;
    },

    // Distribute roles to players
    distributeRoles(playerCount, selectedSpecials) {
        const spyCount = this.getSpyCount(playerCount);
        const resistanceCount = playerCount - spyCount;
        
        const roles = [];
        let specialsUsed = {
            resistance: [],
            spy: []
        };

        // Process selected special characters
        selectedSpecials.forEach(specialKey => {
            const char = this.characters[specialKey];
            
            if (specialKey === 'inquisidor') {
                // Inquisidor can be either faction - decide randomly
                const faction = Math.random() < 0.5 ? 'resistance' : 'spy';
                specialsUsed[faction].push({
                    ...char,
                    faction: faction,
                    key: specialKey
                });
            } else {
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
        return this.shuffleArray(roles);
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
                    playerNum: index + 1
                });
            }
        });
        return spies;
    },

    // Save game state
    saveGame(playerCount, roles) {
        const gameState = {
            playerCount: playerCount,
            roles: roles,
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
