document.addEventListener('DOMContentLoaded', () => {
    const gameState = GameManager.loadGame();
    
    if (!gameState) {
        alert('Nenhum jogo encontrado! Redirecionando para configuração...');
        window.location.href = 'index.html';
        return;
    }

    let currentPlayer = 0;
    const { playerCount, roles } = gameState;

    // Update UI for current player
    function updateUI() {
        document.getElementById('currentPlayerNum').textContent = currentPlayer + 1;
        document.getElementById('playerNumber').textContent = currentPlayer + 1;
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

        // Add special information based on role
        if (role.knowsSpies && !role.isBlind && !role.isFalseCommander) {
            const spies = GameManager.getSpyInfo(roles, currentPlayer);
            const otherSpies = spies.filter(s => s.index !== currentPlayer);
            
            if (otherSpies.length > 0) {
                infoHTML += `
                    <div class="spy-list">
                        <h3>🔍 ${role.faction === 'spy' ? 'Outros Espiões' : 'Espiões Identificados'}:</h3>
                        <ul>
                            ${otherSpies.map(spy => `<li>Jogador ${spy.playerNum}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }

        if (role.isBlind) {
            infoHTML += `
                <div class="info-box warning">
                    <p><strong>⚠️ Atenção:</strong> Você não conhece os outros espiões e eles não conhecem você!</p>
                </div>
            `;
        }

        if (role.isFalseCommander) {
            infoHTML += `
                <div class="info-box warning">
                    <p><strong>⚠️ Cuidado:</strong> Você parece ser o Comandante, mas é um espião! Os outros espiões não conhecem você.</p>
                </div>
            `;
        }

        if (role.key === 'assassino') {
            infoHTML += `
                <div class="info-box">
                    <h3>🎯 Missão Especial:</h3>
                    <p>Se a Resistência vencer 3 missões, você terá a chance de identificar e eliminar o Comandante. Se acertar, os espiões vencem!</p>
                </div>
            `;
        }

        if (role.key === 'inquisidor') {
            infoHTML += `
                <div class="info-box">
                    <h3>🔎 Habilidade Especial:</h3>
                    <p>Uma vez durante o jogo, você pode verificar secretamente a lealdade de um jogador.</p>
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
