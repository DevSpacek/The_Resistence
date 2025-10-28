document.addEventListener('DOMContentLoaded', () => {
    const gameState = GameManager.loadGame();
    
    if (!gameState) {
        alert('Nenhum jogo encontrado! Redirecionando para configuração...');
        window.location.href = 'index.html';
        return;
    }

    let currentPlayer = 0;
    const { playerCount, roles, playerNames } = gameState;

    // Update UI for current player
    function updateUI() {
        const playerName = roles[currentPlayer].playerName;
        document.getElementById('currentPlayerNum').textContent = playerName;
        document.getElementById('playerNumber').textContent = playerName;
    }

    // Show privacy screen
    function showPrivacyScreen() {
        document.getElementById('privacyScreen').classList.remove('hidden');
        document.getElementById('roleScreen').classList.add('hidden');
    }

    // Show role screen
    function showRoleScreen() {
        document.getElementById('privacyScreen').classList.add('hidden');
        document.getElementById('roleScreen').classList.remove('hidden');
        
        const role = roles[currentPlayer];
        displayRole(role);
    }

    // Display role information
    function displayRole(role) {
        const roleCard = document.getElementById('roleCard');
        const roleTitle = document.getElementById('roleTitle');
        const roleIcon = document.getElementById('roleIcon');
        const factionBadge = document.getElementById('factionBadge');
        const roleInfo = document.getElementById('roleInfo');

        // Set faction styling
        roleCard.className = 'role-card ' + role.faction;
        factionBadge.className = 'faction-badge ' + role.faction;
        
        // Set basic info
        roleTitle.textContent = role.displayName;
        roleIcon.textContent = role.displayName.split(' ')[0]; // Get emoji
        factionBadge.textContent = role.faction === 'resistance' ? 'Resistência' : 'Espião';

        // Build role information
        let infoHTML = `<p>${role.description}</p>`;

        // Comandante - shows spies (respecting visibility rules)
        if (role.key === 'comandante') {
            const spies = GameManager.getSpyInfo(roles, currentPlayer);
            const visibleSpies = spies.filter(s => s.visibleToCommander);
            
            if (visibleSpies.length > 0) {
                infoHTML += `
                    <div class="spy-list">
                        <h3>🔍 Espiões Identificados:</h3>
                        <ul>
                            ${visibleSpies.map(spy => `<li><strong>${spy.playerName}</strong></li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }

        // Guarda-Costas - shows commander(s)
        if (role.key === 'guardacostas') {
            const commanders = GameManager.getCommanderInfo(roles);
            
            if (commanders.length > 0) {
                infoHTML += `
                    <div class="spy-list">
                        <h3>👑 Comandante(s) Identificado(s):</h3>
                        <ul>
                            ${commanders.map(cmd => `<li><strong>${cmd.playerName}</strong></li>`).join('')}
                        </ul>
                `;
                
                if (commanders.length > 1) {
                    infoHTML += `<p class="warning">⚠️ Atenção: Há mais de um comandante! Um deles é falso, mas você não sabe qual.</p>`;
                }
                
                infoHTML += `</div>`;
            }
        }

        // Regular spies (not blind, not false commander without knowledge)
        if (role.knowsSpies && !role.isBlind && role.faction === 'spy') {
            const spies = GameManager.getSpyInfo(roles, currentPlayer);
            const otherSpies = spies.filter(s => s.index !== currentPlayer);
            
            if (otherSpies.length > 0) {
                infoHTML += `
                    <div class="spy-list">
                        <h3>🔍 Outros Espiões:</h3>
                        <ul>
                            ${otherSpies.map(spy => `<li><strong>${spy.playerName}</strong></li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }

        // Blind spy warning
        if (role.isBlind) {
            infoHTML += `
                <div class="info-box warning">
                    <p><strong>⚠️ Atenção:</strong> Você não conhece os outros espiões e eles não conhecem você!</p>
                </div>
            `;
        }

        // Agente Invisível info
        if (role.key === 'agenteinvisivel') {
            infoHTML += `
                <div class="info-box">
                    <p><strong>👻 Invisibilidade:</strong> O Comandante NÃO consegue ver você!</p>
                </div>
            `;
        }

        // False Commander without knowledge
        if (role.isFalseCommander && !role.knowsSpies) {
            infoHTML += `
                <div class="info-box warning">
                    <p><strong>⚠️ Cuidado:</strong> Você parece ser o Comandante, mas é um espião! Você NÃO conhece os outros espiões.</p>
                </div>
            `;
        }

        // Assassino special mission
        if (role.key === 'assassino') {
            infoHTML += `
                <div class="info-box">
                    <h3>🎯 Missão Especial:</h3>
                    <p>Se a Resistência vencer 3 missões, você terá a chance de identificar e eliminar o Comandante. Se acertar, os espiões vencem!</p>
                </div>
            `;
        }

        // Desertor ability
        if (role.isDesertor) {
            infoHTML += `
                <div class="info-box">
                    <h3>🔄 Habilidade Especial:</h3>
                    <p>Você pode trocar de lado durante o jogo. Use esta habilidade estrategicamente!</p>
                </div>
            `;
        }

        roleInfo.innerHTML = infoHTML;

        // Update next button
        const btnNext = document.getElementById('btnNext');
        if (currentPlayer === playerCount - 1) {
            btnNext.textContent = 'Finalizar e Voltar';
        } else {
            btnNext.textContent = 'Próximo Jogador';
        }
    }

    // Reveal button
    document.getElementById('btnReveal').addEventListener('click', () => {
        showRoleScreen();
    });

    // Next button
    document.getElementById('btnNext').addEventListener('click', () => {
        currentPlayer++;
        
        if (currentPlayer >= playerCount) {
            // Game finished, return to setup
            GameManager.clearGame();
            window.location.href = 'index.html';
        } else {
            // Show next player
            updateUI();
            showPrivacyScreen();
        }
    });

    // Initialize
    updateUI();
    showPrivacyScreen();
});