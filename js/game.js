// Game state, character definitions, and Mission Board Engine
const GameManager = {
	// Official Mission Requirements Table [round1..round5]
	missionTable: {
		5: [2, 3, 2, 3, 3],
		6: [2, 3, 4, 3, 4],
		7: [2, 3, 3, 4, 4],
		8: [3, 4, 4, 5, 5],
		9: [3, 4, 4, 5, 5],
		10: [3, 4, 4, 5, 5],
	},

	// Character definitions
	characters: {
		// Resistance characters
		comandante: {
			name: "Comandante",
			displayName: "👑 Comandante",
			faction: "resistance",
			isSpecial: true,
			knowsSpies: true,
			knowsBlindSpy: true, // SEMPRE conhece o Espião Cego (regra oficial)
			description:
				"Você é o líder da Resistência e conhece TODOS os espiões (incluindo o Espião Cego)!",
		},
		guardacostas: {
			name: "Guarda-Costas",
			displayName: "🛡️ Guarda-Costas",
			faction: "resistance",
			isSpecial: true,
			knowsCommander: true,
			description: "Você sabe quem é o Comandante e deve protegê-lo.",
		},
		desertorResistencia: {
			name: "Desertor",
			displayName: "🔄 Desertor",
			faction: "resistance",
			isSpecial: true,
			isDesertor: true,
			description:
				"Você está na Resistência, mas pode trocar de lado a partir da 3ª rodada com o Baralho de Troca de Lealdade.",
		},
		// Spy characters
		assassino: {
			name: "Assassino",
			displayName: "🗡️ Assassino",
			faction: "spy",
			isSpecial: true,
			knowsSpies: true,
			visibleToCommander: true,
			description:
				"Você deve identificar e eliminar o Comandante para vencer! Se a Resistência vencer 3 missões, você tem uma chance de matá-lo.",
		},
		espiaocego: {
			name: "Espião Cego",
			displayName: "👁️ Espião Cego",
			faction: "spy",
			isSpecial: true,
			isBlind: true,
			visibleToCommander: true, // SEMPRE visível ao Comandante (regra oficial)
			description:
				"Você não conhece os outros espiões e eles não conhecem você, MAS o Comandante sabe quem você é.",
		},
		agenteinvisivel: {
			name: "Agente Invisível",
			displayName: "👻 Agente Invisível",
			faction: "spy",
			isSpecial: true,
			knowsSpies: true,
			visibleToCommander: false, // Invisível ao Comandante (regra oficial)
			description:
				"Você conhece os outros espiões, mas é INVISÍVEL ao Comandante!",
		},
		comandantefalso: {
			name: "Comandante Falso",
			displayName: "👹 Comandante Falso",
			faction: "spy",
			isSpecial: true,
			isFalseCommander: true,
			knowsSpies: false, // Padrão: não conhece (pode ser alterado por opção)
			visibleToCommander: true,
			description:
				"Você se revela ao Guarda-Costas como se fosse o Comandante!",
		},
		desertorEspiao: {
			name: "Desertor",
			displayName: "🔄 Desertor",
			faction: "spy",
			isSpecial: true,
			isDesertor: true,
			knowsSpies: true,
			visibleToCommander: true,
			thumbsUp: true,
			description:
				"Você é um espião desertor. Pode trocar de lado a partir da 3ª rodada com o Baralho de Troca de Lealdade.",
		},
	},

	// Get spy count based on player count
	getSpyCount(playerCount) {
		if (playerCount <= 6) return 2;
		if (playerCount <= 9) return 3;
		return 4;
	},

	// Get team size required for a given player count and round (1-5)
	getMissionTeamSize(playerCount, roundNumber) {
		const count = Math.min(10, Math.max(5, playerCount || 5));
		const table = this.missionTable[count] || this.missionTable[5];
		return table[roundNumber - 1] || 2;
	},

	// Check if round requires 2 fails for spies to win the mission (Round 4 with 7+ players)
	requiresTwoFails(playerCount, roundNumber) {
		return playerCount >= 7 && roundNumber === 4;
	},

	// Validate and randomly select spy specials if overflow
	validateAndSelectSpySpecials(selectedSpecials, maxSpyCount) {
		const spySpecials = [
			"assassino",
			"espiaocego",
			"agenteinvisivel",
			"comandantefalso",
		];

		// Desertor also takes 1 spy slot
		const selectedSpySpecials = selectedSpecials.filter(
			(s) => spySpecials.includes(s) || s === "desertor"
		);

		// If within limit, return all
		if (selectedSpySpecials.length <= maxSpyCount) {
			return selectedSpecials;
		}

		// Randomly select allowed number of spy specials
		const shuffledSpySpecials = this.shuffleArray(selectedSpySpecials);
		const selectedLimited = shuffledSpySpecials.slice(0, maxSpyCount);

		// Keep all non-spy specials and add limited spy specials
		const resistanceSpecials = selectedSpecials.filter(
			(s) => !spySpecials.includes(s) && s !== "desertor"
		);

		return [...resistanceSpecials, ...selectedLimited];
	},

	// Distribute roles to players
	distributeRoles(playerCount, selectedSpecials, options, playerNames) {
		const spyCount = this.getSpyCount(playerCount);
		const resistanceCount = playerCount - spyCount;

		// Validate and limit spy specials
		const validatedSpecials = this.validateAndSelectSpySpecials(
			selectedSpecials,
			spyCount
		);

		const roles = [];
		let specialsUsed = {
			resistance: [],
			spy: [],
		};

		// Process selected special characters
		validatedSpecials.forEach((specialKey) => {
			if (specialKey === "comandantefalso") {
				const char = { ...this.characters.comandantefalso };
				char.knowsSpies = options.comandanteFalsoKnows;
				if (!options.comandanteFalsoKnows) {
					char.description =
						"Você se revela ao Guarda-Costas como Comandante, mas NÃO conhece os outros espiões.";
				} else {
					char.description =
						"Você se revela ao Guarda-Costas como Comandante e conhece os outros espiões (variante).";
				}
				specialsUsed.spy.push({
					...char,
					key: specialKey,
				});
			} else if (specialKey === "desertor") {
				// Add both desertor types
				const desertorRes = { ...this.characters.desertorResistencia };
				const desertorSpy = { ...this.characters.desertorEspiao };

				// Se desertores se conhecem
				if (options.desertoresKnowEachOther) {
					desertorRes.knowsOtherDesertor = true;
					desertorSpy.knowsOtherDesertor = true;
					desertorRes.description += " Você conhece o outro Desertor.";
					desertorSpy.description += " Você conhece o outro Desertor.";
				}

				specialsUsed.resistance.push({
					...desertorRes,
					key: "desertorResistencia",
				});
				specialsUsed.spy.push({
					...desertorSpy,
					key: "desertorEspiao",
				});
			} else {
				const char = this.characters[specialKey];
				if (char) {
					specialsUsed[char.faction].push({
						...char,
						key: specialKey,
					});
				}
			}
		});

		// Add special resistance roles
		specialsUsed.resistance.forEach((char) => {
			roles.push({
				...char,
				faction: "resistance",
			});
		});

		// Add special spy roles
		specialsUsed.spy.forEach((char) => {
			roles.push({
				...char,
				faction: "spy",
			});
		});

		// Fill remaining resistance slots
		const remainingResistance =
			resistanceCount - specialsUsed.resistance.length;
		for (let i = 0; i < remainingResistance; i++) {
			roles.push({
				name: "Membro da Resistência",
				displayName: "🎭 Membro da Resistência",
				faction: "resistance",
				isSpecial: false,
				description: "Você é um membro leal da Resistência.",
			});
		}

		// Fill remaining spy slots
		const remainingSpies = spyCount - specialsUsed.spy.length;
		for (let i = 0; i < remainingSpies; i++) {
			roles.push({
				name: "Espião",
				displayName: "🕵️ Espião",
				faction: "spy",
				isSpecial: false,
				knowsSpies: true,
				visibleToCommander: true,
				description: "Você é um espião infiltrado na Resistência.",
			});
		}

		// Shuffle roles
		const shuffledRoles = this.shuffleArray(roles);

		// Assign player names and find desertores
		let desertorIndices = [];
		shuffledRoles.forEach((role, index) => {
			role.playerName = playerNames[index] || `Jogador ${index + 1}`;
			role.playerIndex = index;

			// Assign deterministic card background image so it doesn't flicker
			if (role.faction === "resistance") {
				const resistanceImages = [
					"images_back/ally-1-en.jpg",
					"images_back/ally-2-en.jpg",
					"images_back/ally-3-en.jpg",
					"images_back/ally-4-en.jpg",
					"images_back/ally-5.jpg",
					"images_back/ally-6-en.jpg",
				];
				role.bgImage = resistanceImages[index % resistanceImages.length];
			} else {
				const spyImages = [
					"images_back/axis-1-en.jpg",
					"images_back/axis-2-en.jpg",
					"images_back/axis-3-en.jpg",
					"images_back/axis-4.jpg",
				];
				role.bgImage = spyImages[index % spyImages.length];
			}

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

	// Enrich a single role with its allies, tips, and intel (for both single-device & multiplayer)
	enrichRoleWithIntel(role, roles, currentPlayerIndex) {
		const enriched = { ...role };
		enriched.intel = {
			knownSpies: [],
			blindSpyExists: false,
			commanders: [],
			otherDesertor: null,
		};

		// COMANDANTE: sees all spies except Agente Invisível
		if (role.key === "comandante") {
			enriched.intel.knownSpies = this.getAllSpiesForCommander(roles);
		}

		// GUARDA-COSTAS: sees Comandante and Comandante Falso
		if (role.key === "guardacostas") {
			enriched.intel.commanders = this.getCommanderInfo(roles);
		}

		// ESPIÕES REGULARES (não cegos): see other non-blind spies
		if (role.knowsSpies && !role.isBlind && role.faction === "spy") {
			const spies = this.getSpyInfo(roles, currentPlayerIndex);
			enriched.intel.knownSpies = spies.filter(
				(s) => s.index !== currentPlayerIndex
			);
			enriched.intel.blindSpyExists = roles.some(
				(r) => r.isBlind && r.faction === "spy"
			);
		}

		// DESERTORES que se conhecem
		if (role.knowsOtherDesertor && role.otherDesertorIndex !== undefined) {
			const other = roles[role.otherDesertorIndex];
			if (other) {
				enriched.intel.otherDesertor = {
					playerName: other.playerName,
					faction: other.faction,
				};
			}
		}

		return enriched;
	},

	// Render complete HTML for role info & tactical tips (shared across reveal.js and multiplayer.js)
	buildRoleInfoHTML(role, allRoles = null, currentPlayerIndex = 0) {
		const enriched =
			role.intel || !allRoles
				? role
				: this.enrichRoleWithIntel(role, allRoles, currentPlayerIndex);
		const intel = enriched.intel || {};

		let infoHTML = `<p class="role-desc-main">${enriched.description}</p>`;

		// COMANDANTE
		if (enriched.key === "comandante") {
			if (intel.knownSpies && intel.knownSpies.length > 0) {
				infoHTML += `
					<div class="spy-list">
						<h3>🔍 Espiões Identificados:</h3>
						<ul>
							${intel.knownSpies
								.map(
									(spy) =>
										`<li><strong>${spy.playerName}</strong>${
											spy.isBlind ? " <span class='tag-blind'>(Espião Cego)</span>" : ""
										}</li>`
								)
								.join("")}
						</ul>
					</div>
				`;
			}
			const hasInvisible =
				allRoles && allRoles.some((r) => r.key === "agenteinvisivel");
			if (hasInvisible || enriched.hasInvisibleWarning) {
				infoHTML += `
					<div class="info-box warning">
						<p><strong>👻 Atenção:</strong> Há um <strong>Agente Invisível</strong> em jogo que não aparece na sua lista!</p>
					</div>
				`;
			}
			infoHTML += `
				<div class="info-box">
					<p><strong>💡 Dica Tática:</strong> Guie a Resistência sutilmente. Se o Assassino descobrir quem você é ao final, os Espiões roubam a vitória!</p>
				</div>
			`;
		}

		// GUARDA-COSTAS
		if (enriched.key === "guardacostas") {
			if (intel.commanders && intel.commanders.length > 0) {
				infoHTML += `
					<div class="spy-list">
						<h3>👑 Comandante(s) Identificado(s):</h3>
						<ul>
							${intel.commanders
								.map((cmd) => `<li><strong>${cmd.playerName}</strong></li>`)
								.join("")}
						</ul>
				`;
				if (intel.commanders.length > 1) {
					infoHTML += `<p class="warning">⚠️ Atenção: Há ${intel.commanders.length} candidatos! Um é o Comandante Verdadeiro e o outro é o Comandante Falso.</p>`;
				}
				infoHTML += `</div>`;
			}
		}

		// ESPIÕES QUE CONHECEM ALIADOS
		if (enriched.knowsSpies && !enriched.isBlind && enriched.faction === "spy") {
			if (intel.knownSpies && intel.knownSpies.length > 0) {
				infoHTML += `
					<div class="spy-list">
						<h3>🕵️ Seus Aliados Espiões:</h3>
						<ul>
							${intel.knownSpies
								.map((spy) => `<li><strong>${spy.playerName}</strong></li>`)
								.join("")}
						</ul>
				`;
				if (intel.blindSpyExists) {
					infoHTML += `<p class="warning">⚠️ Há um Espião Cego em jogo que não aparece nesta lista e não conhece vocês.</p>`;
				}
				infoHTML += `</div>`;
			} else if (intel.blindSpyExists) {
				infoHTML += `
					<div class="info-box warning">
						<p>⚠️ O outro espião é um <strong>Espião Cego</strong> — ele não aparece na lista e não conhece você.</p>
					</div>
				`;
			}
		}

		// ESPIÃO CEGO
		if (enriched.isBlind) {
			infoHTML += `
				<div class="info-box warning">
					<p><strong>⚠️ Isolamento:</strong> Você NÃO conhece os outros espiões e eles NÃO conhecem você!</p>
					<p><strong>⚠️ Alerta:</strong> O Comandante SABE quem você é!</p>
				</div>
			`;
		}

		// AGENTE INVISÍVEL
		if (enriched.key === "agenteinvisivel") {
			infoHTML += `
				<div class="info-box">
					<p><strong>👻 Camuflagem Total:</strong> O Comandante NÃO consegue ver você na lista dele. Conquiste a confiança dele!</p>
				</div>
			`;
		}

		// COMANDANTE FALSO
		if (enriched.isFalseCommander && !enriched.knowsSpies) {
			infoHTML += `
				<div class="info-box warning">
					<p><strong>👹 Impostor:</strong> Você aparece para o Guarda-Costas como Comandante!</p>
					<p>Você NÃO conhece os outros espiões (regra oficial).</p>
				</div>
			`;
		} else if (enriched.isFalseCommander && enriched.knowsSpies) {
			infoHTML += `
				<div class="info-box warning">
					<p><strong>👹 Impostor:</strong> Você aparece para o Guarda-Costas como Comandante e conhece os outros espiões (variante).</p>
				</div>
			`;
		}

		// ASSASSINO
		if (enriched.key === "assassino") {
			infoHTML += `
				<div class="info-box">
					<h3>🎯 Alvo Prioritário:</h3>
					<p>Se a Resistência vencer 3 missões, você terá UMA CHANCE final de executar o Comandante. Observe quem sabe demais!</p>
				</div>
			`;
		}

		// DESERTOR
		if (enriched.isDesertor) {
			infoHTML += `
				<div class="info-box">
					<h3>🔄 Troca de Lealdade:</h3>
					<p>A partir da 3ª rodada, uma carta do Baralho do Desertor é sorteada no início da rodada.</p>
					<p>Se sair <strong>"Troca de Lealdade"</strong>, você e o outro Desertor invertem suas facções!</p>
				</div>
			`;

			if (intel.otherDesertor) {
				infoHTML += `
					<div class="spy-list">
						<h3>🔄 Outro Desertor:</h3>
						<ul>
							<li><strong>${intel.otherDesertor.playerName}</strong> (${
					intel.otherDesertor.faction === "spy" ? "Espião" : "Resistência"
				})</li>
						</ul>
					</div>
				`;
			}
		}

		return infoHTML;
	},

	// Create initial board & round state (including Desertor Loyalty Deck)
	createBoardState(playerCount, hasDesertor = false, playerNames = []) {
		// Official Desertor Loyalty Change Deck (used in Rounds 3, 4, 5 -> 5 cards: 3 "Sem Mudança", 2 "Troca de Lealdade")
		const loyaltyDeck = this.shuffleArray([
			{ type: "no_change", title: "Manter Lealdade", subtitle: "Ninguém troca de lado nesta rodada." },
			{ type: "no_change", title: "Manter Lealdade", subtitle: "Ninguém troca de lado nesta rodada." },
			{ type: "no_change", title: "Manter Lealdade", subtitle: "Ninguém troca de lado nesta rodada." },
			{ type: "swap", title: "TROCA DE LEALDADE!", subtitle: "Os Desertores trocam de facção imediatamente!" },
			{ type: "swap", title: "TROCA DE LEALDADE!", subtitle: "Os Desertores trocam de facção imediatamente!" },
		]);

		const names =
			playerNames && playerNames.length === playerCount
				? [...playerNames]
				: Array.from({ length: playerCount }, (_, i) => `Jogador ${i + 1}`);

		return {
			playerCount: playerCount,
			playerNames: names,
			currentRound: 1, // 1 to 5
			rejectedTeamsCount: 0, // 0 to 5
			leaderIndex: 0,
			rounds: [
				{ round: 1, status: "current", teamSize: this.getMissionTeamSize(playerCount, 1), requiresTwoFails: false, failsCount: 0 },
				{ round: 2, status: "pending", teamSize: this.getMissionTeamSize(playerCount, 2), requiresTwoFails: false, failsCount: 0 },
				{ round: 3, status: "pending", teamSize: this.getMissionTeamSize(playerCount, 3), requiresTwoFails: false, failsCount: 0 },
				{ round: 4, status: "pending", teamSize: this.getMissionTeamSize(playerCount, 4), requiresTwoFails: this.requiresTwoFails(playerCount, 4), failsCount: 0 },
				{ round: 5, status: "pending", teamSize: this.getMissionTeamSize(playerCount, 5), requiresTwoFails: false, failsCount: 0 },
			],
			resistanceWins: 0,
			spyWins: 0,
			gameOver: false,
			winner: null, // 'resistance' | 'spy'
			winReason: "",
			hasDesertor: hasDesertor,
			loyaltyDeck: loyaltyDeck,
			drawnLoyaltyCards: [],
			currentRoundLoyaltyDrawn: false,
			swappedCount: 0,
		};
	},

	// Draw a card from the Desertor Loyalty Deck
	drawDesertorCard(boardState) {
		if (!boardState.loyaltyDeck || boardState.loyaltyDeck.length === 0) {
			// Reshuffle a fresh deck if exhausted
			boardState.loyaltyDeck = this.shuffleArray([
				{ type: "no_change", title: "Manter Lealdade", subtitle: "Ninguém troca de lado nesta rodada." },
				{ type: "no_change", title: "Manter Lealdade", subtitle: "Ninguém troca de lado nesta rodada." },
				{ type: "no_change", title: "Manter Lealdade", subtitle: "Ninguém troca de lado nesta rodada." },
				{ type: "swap", title: "TROCA DE LEALDADE!", subtitle: "Os Desertores trocam de facção imediatamente!" },
				{ type: "swap", title: "TROCA DE LEALDADE!", subtitle: "Os Desertores trocam de facção imediatamente!" },
			]);
		}
		const card = boardState.loyaltyDeck.pop();
		card.round = boardState.currentRound;
		card.timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
		boardState.drawnLoyaltyCards.push(card);
		boardState.currentRoundLoyaltyDrawn = true;
		if (card.type === "swap") {
			boardState.swappedCount = (boardState.swappedCount || 0) + 1;
		}
		return card;
	},

	// Record team approval vote result
	// Official rule: 5 consecutive rejected teams awards the round/victory to the Spies
	registerTeamVoteResult(boardState, approved) {
		if (boardState.gameOver) return { action: "gameover" };

		if (approved) {
			return {
				action: "approved",
				message: "Equipe Aprovada! Prossiga para a Votação Secreta da Missão.",
			};
		} else {
			boardState.rejectedTeamsCount++;
			boardState.leaderIndex = (boardState.leaderIndex + 1) % boardState.playerCount;

			if (boardState.rejectedTeamsCount >= 5) {
				// 5 rejections in a row -> Point for Spies!
				this.recordRoundOutcome(boardState, "spy", 5, "5 equipes rejeitadas seguidas (Ponto automático para os Espiões)");
				return {
					action: "five_rejections_point",
					message: "⚠️ 5 Equipes Rejeitadas seguidas! Vitória da rodada para os ESPIÕES!",
				};
			}

			return {
				action: "rejected",
				rejectedCount: boardState.rejectedTeamsCount,
				message: `Equipe Rejeitada! (${boardState.rejectedTeamsCount}/5). O líder passa para o próximo jogador.`,
			};
		}
	},

	// Record mission outcome ('resistance' or 'spy')
	recordRoundOutcome(boardState, winningFaction, failsCount = 0, customNote = "") {
		if (boardState.gameOver) return;

		const roundIdx = boardState.currentRound - 1;
		if (roundIdx >= 0 && roundIdx < 5) {
			boardState.rounds[roundIdx].status = winningFaction;
			boardState.rounds[roundIdx].failsCount = failsCount;
			boardState.rounds[roundIdx].note = customNote;
		}

		if (winningFaction === "resistance") {
			boardState.resistanceWins++;
		} else {
			boardState.spyWins++;
		}

		// Reset consecutive rejections and advance leader
		boardState.rejectedTeamsCount = 0;
		boardState.leaderIndex = (boardState.leaderIndex + 1) % boardState.playerCount;
		boardState.currentRoundLoyaltyDrawn = false;

		// Check victory conditions (3 points wins)
		if (boardState.resistanceWins >= 3) {
			boardState.gameOver = true;
			boardState.winner = "resistance";
			boardState.winReason = "A Resistência completou 3 missões com sucesso!";
		} else if (boardState.spyWins >= 3) {
			boardState.gameOver = true;
			boardState.winner = "spy";
			boardState.winReason = "Os Espiões sabotaram 3 missões!";
		} else if (boardState.currentRound < 5) {
			boardState.currentRound++;
			boardState.rounds[boardState.currentRound - 1].status = "current";
		}
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
			if (role.faction === "spy" && !role.isBlind) {
				spies.push({
					index: index,
					name: role.displayName,
					playerName: role.playerName,
					playerNum: index + 1,
					visibleToCommander: role.visibleToCommander !== false,
					thumbsUp: role.thumbsUp || false,
				});
			}
		});
		return spies;
	},

	// Get ALL spies including blind spy (for Comandante only)
	getAllSpiesForCommander(roles) {
		const spies = [];
		roles.forEach((role, index) => {
			if (role.faction === "spy") {
				// Comandante vê TODOS exceto os invisíveis
				if (role.visibleToCommander !== false) {
					spies.push({
						index: index,
						name: role.displayName,
						playerName: role.playerName,
						playerNum: index + 1,
						isBlind: role.isBlind || false,
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
			if (role.key === "comandante" || role.key === "comandantefalso") {
				commanders.push({
					index: index,
					name: role.displayName,
					playerName: role.playerName,
					playerNum: index + 1,
					isReal: role.key === "comandante",
				});
			}
		});
		return commanders;
	},

	// Save game state
	saveGame(playerCount, roles, playerNames, options = {}, selectedSpecials = []) {
		const hasDesertor =
			selectedSpecials.includes("desertor") ||
			roles.some((r) => r.isDesertor);

		const enrichedRoles = roles.map((r, idx) =>
			this.enrichRoleWithIntel(r, roles, idx)
		);

		const gameState = {
			playerCount: playerCount,
			roles: enrichedRoles,
			playerNames: playerNames,
			options: options,
			selectedSpecials: selectedSpecials,
			boardState: this.createBoardState(playerCount, hasDesertor, playerNames),
			currentPlayer: 0,
			timestamp: Date.now(),
		};
		localStorage.setItem("resistanceGame", JSON.stringify(gameState));
	},

	// Update existing saved game state
	updateSavedGame(gameState) {
		localStorage.setItem("resistanceGame", JSON.stringify(gameState));
	},

	// Load game state
	loadGame() {
		const saved = localStorage.getItem("resistanceGame");
		return saved ? JSON.parse(saved) : null;
	},

	// Clear game state
	clearGame() {
		localStorage.removeItem("resistanceGame");
	},
};
