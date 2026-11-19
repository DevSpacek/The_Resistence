// Interactive Mini Board, Team Approval, Secret Mission Voting, and Desertor Loyalty Deck UI Controller
class BoardUIController {
	constructor(options = {}) {
		this.container = options.container;
		this.boardState = options.boardState;
		this.roles = options.roles || null; // null in Master Mode
		this.mode = options.mode || "single"; // 'single' | 'master' | 'multiplayer-host' | 'multiplayer-client'
		this.myPlayerIndex = options.myPlayerIndex ?? 0;
		this.onStateChange = options.onStateChange || (() => {});
		this.onMultiplayerAction = options.onMultiplayerAction || (() => {});

		// Local sub-state for single-device / master mode interactive flows
		this.activePhase = "overview"; // 'overview' | 'team_select' | 'team_vote_pass' | 'mission_vote_pass' | 'mission_reveal' | 'loyalty_card_modal' | 'assassin_guess'
		this.selectedTeamIndices = new Set();
		this.passVoteIndex = 0;
		this.collectedTeamVotes = []; // [{ playerName, vote: true/false }]
		this.collectedMissionVotes = []; // ['success', 'fail']
		this.passPrivacyHidden = true;
		this.lastLoyaltyCard = null;
		this.statusBanner = null;
	}

	setBoardState(newState) {
		this.boardState = newState;
		this.render();
	}

	showBanner(message, type = "info") {
		this.statusBanner = { message, type };
		this.render();
	}

	clearBanner() {
		this.statusBanner = null;
	}

	render() {
		if (!this.container || !this.boardState) return;
		const bs = this.boardState;
		const currentRoundObj = bs.rounds[bs.currentRound - 1] || bs.rounds[4];
		const requiredTeamSize = currentRoundObj.teamSize;
		const needsTwoFails = currentRoundObj.requiresTwoFails;
		const leaderName = bs.playerNames[bs.leaderIndex] || `Jogador ${bs.leaderIndex + 1}`;

		// Coordinates of the 5 mission hexagons on images_back/mission-map.png (600x400)
		const mapNodes = [
			{ round: 1, name: "01 • Rescue", left: "11.83%", top: "50.75%" },
			{ round: 2, name: "02 • Intelligence", left: "20.00%", top: "14.50%" },
			{ round: 3, name: "03 • Infiltration", left: "55.67%", top: "27.50%" },
			{ round: 4, name: "04* • Sabotage", left: "41.67%", top: "73.25%" },
			{ round: 5, name: "05 • Ambush", left: "87.17%", top: "38.75%" },
		];

		let html = `
			<div class="tactical-board">
				<!-- Top Score & Leader Bar -->
				<div class="board-header-bar">
					<div class="score-pill resistance-score">
						<img src="images_back/token-ally.png" alt="Resistência" class="score-token-icon">
						<span class="score-label">RESISTÊNCIA</span>
						<span class="score-value">${bs.resistanceWins}</span>
					</div>
					<div class="round-indicator-center">
						<span class="round-tag">MISSÃO ${bs.currentRound}/5</span>
						<span class="team-req-tag">Equipe de <strong>${requiredTeamSize}</strong>${needsTwoFails ? " <em class='two-fails-badge'>(2 Falhas p/ Sabotar)</em>" : ""}</span>
					</div>
					<div class="score-pill spy-score">
						<span class="score-value">${bs.spyWins}</span>
						<span class="score-label">ESPIÕES</span>
						<img src="images_back/token-axis.png" alt="Espiões" class="score-token-icon">
					</div>
				</div>

				<!-- Visual Mission Map Board with Overlaid Hexagonal Faction Tokens -->
				<div class="mission-map-wrapper">
					<img src="images_back/mission-map.png" alt="Mission Map - The Resistance" class="mission-map-img">
					${bs.rounds
						.map((r, idx) => {
							const coords = mapNodes[idx];
							let tokenHTML = "";
							let badgeText = `${r.teamSize} Agentes`;
							if (r.status === "resistance") {
								tokenHTML = `<img src="images_back/token-ally.png" alt="Vitória da Resistência" class="hex-token-img token-drop-anim">`;
								badgeText = "✓ Resistência";
							} else if (r.status === "spy") {
								tokenHTML = `<img src="images_back/token-axis.png" alt="Vitória dos Espiões" class="hex-token-img token-drop-anim">`;
								badgeText = r.failsCount ? `✖ ${r.failsCount} Falha(s)` : "✖ Sabotada";
							} else if (r.status === "current") {
								tokenHTML = `
									<div class="hex-current-target">
										<span class="hex-team-count">${r.teamSize}${r.requiresTwoFails ? "*" : ""}</span>
									</div>
								`;
								badgeText = `Atual (${r.teamSize} Agentes)`;
							} else {
								tokenHTML = `
									<div class="hex-pending-target">
										<span class="hex-team-count-subtle">${r.teamSize}${r.requiresTwoFails ? "*" : ""}</span>
									</div>
								`;
							}

							return `
								<div class="map-hex-slot ${r.status}" style="left: ${coords.left}; top: ${coords.top};" title="Missão ${r.round} (${coords.name}) - Equipe: ${r.teamSize}">
									${tokenHTML}
									<span class="map-hex-caption">${badgeText}</span>
								</div>
							`;
						})
						.join("")}
				</div>

				<!-- Rejections Track (5 Falcons / Votes) & Current Leader -->
				<div class="board-meta-strip">
					<div class="leader-box">
						<span class="meta-label">👑 Líder da Rodada:</span>
						<div class="leader-controls">
							<strong class="leader-name">${leaderName}</strong>
							${
								this.mode !== "multiplayer-client" && !bs.gameOver
									? `<button type="button" class="btn-mini-icon" data-action="next-leader" title="Passar Liderança">⏭️</button>`
									: ""
							}
						</div>
					</div>

					<div class="rejection-track-box">
						<span class="meta-label">Votações Rejeitadas (${bs.rejectedTeamsCount}/5):</span>
						<div class="rejection-pips">
							${[1, 2, 3, 4, 5]
								.map(
									(num) => `
								<span class="rej-pip ${bs.rejectedTeamsCount >= num ? "active" : ""} ${num === 5 ? "critical" : ""}">
									${num}
								</span>
							`
								)
								.join("")}
						</div>
						<span class="rej-rule-hint">5 equipes rejeitadas = Ponto automático para os Espiões</span>
					</div>
				</div>
		`;

		// Status Banner
		if (this.statusBanner) {
			html += `
				<div class="tactical-alert ${this.statusBanner.type}">
					<p>${this.statusBanner.message}</p>
				</div>
			`;
		}

		// Desertor Loyalty Deck Bar (Always available in Master Mode or when Desertor is enabled)
		if (bs.hasDesertor || this.mode === "master") {
			const canDraw = bs.currentRound >= 3;
			const remainingCards = bs.loyaltyDeck ? bs.loyaltyDeck.length : 5;
			html += `
				<div class="desertor-bar ${canDraw ? "active-round" : ""}">
					<div class="desertor-bar-info">
						<span class="desertor-badge">🔄 MODO DESERTOR</span>
						<p>
							${
								bs.currentRound < 3
									? `Ativo a partir da 3ª Rodada (Rodada atual: ${bs.currentRound})`
									: `Baralho de Lealdade: <strong>${remainingCards}</strong> carta(s) restante(s)`
							}
							${bs.swappedCount > 0 ? ` • <span class="swap-counter">Trocas ocorridas: ${bs.swappedCount}x</span>` : ""}
						</p>
					</div>
					${
						this.mode !== "multiplayer-client"
							? `<button type="button" class="btn-desertor-draw" data-action="draw-desertor">
									🃏 Sortear Carta do Desertor
							   </button>`
							: ""
					}
				</div>
			`;
		}

		// Phase Content
		if (bs.gameOver) {
			html += this.renderGameOver(bs);
		} else {
			html += this.renderActivePhase(bs, currentRoundObj);
		}

		html += `</div>`; // close .tactical-board
		this.container.innerHTML = html;
		this.attachEvents();
	}

	renderGameOver(bs) {
		const isRes = bs.winner === "resistance";
		const hasAssassin =
			this.roles && this.roles.some((r) => r.key === "assassino");
		const hasCommander =
			this.roles && this.roles.some((r) => r.key === "comandante");

		return `
			<div class="board-gameover ${isRes ? "resistance-win" : "spy-win"}">
				<div class="gameover-medal">${isRes ? "🛡️ VITÓRIA DA RESISTÊNCIA" : "🗡️ VITÓRIA DOS ESPIÕES"}</div>
				<p class="gameover-reason">${bs.winReason}</p>
				${
					isRes && (hasAssassin || this.mode === "master")
						? `<div class="assassin-last-chance">
								<h4>🗡️ Última Chance do Assassino!</h4>
								<p>Se houver Assassino e Comandante na partida, o Assassino pode tentar adivinhar quem é o Comandante agora. Se acertar, os Espiões roubam a vitória!</p>
								${
									this.mode !== "multiplayer-client"
										? `<button type="button" class="btn-spy-action" data-action="assassin-steal">🗡️ Assassino Acertou o Comandante (Vitória Espiões)</button>`
										: ""
								}
						   </div>`
						: ""
				}
				${
					this.mode !== "multiplayer-client"
						? `<div class="gameover-actions">
								<button type="button" class="btn-secondary" data-action="reset-board">🔄 Reiniciar Tabuleiro</button>
						   </div>`
						: ""
				}
			</div>
		`;
	}

	renderActivePhase(bs, currentRoundObj) {
		if (this.mode === "multiplayer-client") {
			return this.renderMultiplayerClientPhase(bs, currentRoundObj);
		}

		switch (this.activePhase) {
			case "team_select":
				return this.renderTeamSelectPhase(bs, currentRoundObj);
			case "team_vote_pass":
				return this.renderTeamVotePassPhase(bs, currentRoundObj);
			case "team_vote_summary":
				return this.renderTeamVoteSummaryPhase(bs, currentRoundObj);
			case "mission_vote_pass":
				return this.renderMissionVotePassPhase(bs, currentRoundObj);
			case "mission_reveal":
				return this.renderMissionRevealPhase(bs, currentRoundObj);
			case "loyalty_card_modal":
				return this.renderLoyaltyCardModal(bs);
			default:
				return this.renderOverviewPhase(bs, currentRoundObj);
		}
	}

	renderOverviewPhase(bs, currentRoundObj) {
		return `
			<div class="board-phase-panel">
				<h3 class="phase-title">📋 Painel de Controle da Rodada ${bs.currentRound}</h3>
				<p class="phase-subtitle">Gerencie a aprovação da equipe e a votação secreta da missão.</p>

				<!-- STEP 1: Team Approval -->
				<div class="action-card-group">
					<div class="action-group-header">
						<span class="step-num">1</span>
						<div>
							<h4>Aprovação da Equipe (${currentRoundObj.teamSize} integrantes)</h4>
							<p>Todos os jogadores votam para aprovar ou rejeitar a equipe proposta pelo Líder.</p>
						</div>
					</div>
					<div class="action-buttons-row">
						<button type="button" class="btn-tactical approve" data-action="quick-team-approve">
							✅ Equipe Aprovada
						</button>
						<button type="button" class="btn-tactical reject" data-action="quick-team-reject">
							❌ Equipe Rejeitada (${bs.rejectedTeamsCount}/5)
						</button>
					</div>
					<div class="action-sub-row">
						<button type="button" class="btn-secondary btn-sm" data-action="start-pass-team-vote">
							🗳️ Votação Individual no Aparelho (Passando o Celular)
						</button>
					</div>
				</div>

				<!-- STEP 2: Secret Mission Execution -->
				<div class="action-card-group">
					<div class="action-group-header">
						<span class="step-num">2</span>
						<div>
							<h4>Votação Anônima da Missão (${currentRoundObj.teamSize} cartas)</h4>
							<p>Os ${currentRoundObj.teamSize} jogadores escalados votam secretamente entre <strong>Sucesso</strong> ou <strong>Sabotar</strong>.</p>
						</div>
					</div>
					<div class="action-buttons-row">
						<button type="button" class="btn-primary" data-action="start-mission-pass">
							🕵️ Iniciar Votação Secreta da Missão (${currentRoundObj.teamSize} Votos)
						</button>
					</div>
					<div class="manual-outcome-row">
						<span class="manual-label">Ou registrar resultado direto (jogo físico) / Reiniciar:</span>
						<div class="manual-btns">
							<button type="button" class="btn-mini-outcome res" data-action="manual-round-res">
								🛡️ Ponto Resistência
							</button>
							<button type="button" class="btn-mini-outcome spy" data-action="manual-round-spy">
								🗡️ Ponto Espiões
							</button>
							<button type="button" class="btn-mini-outcome btn-danger" data-action="reset-board">
								🔄 Reiniciar Tabuleiro
							</button>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	renderTeamVotePassPhase(bs) {
		const voterName = bs.playerNames[this.passVoteIndex] || `Jogador ${this.passVoteIndex + 1}`;
		if (this.passPrivacyHidden) {
			return `
				<div class="board-phase-panel pass-device-box">
					<span class="pass-badge">🗳️ VOTAÇÃO DE EQUIPE (${this.passVoteIndex + 1}/${bs.playerCount})</span>
					<h3>Passe o dispositivo para:</h3>
					<div class="pass-player-name">${voterName}</div>
					<p>Vote para aprovar ou rejeitar a equipe proposta pelo Líder.</p>
					<button type="button" class="btn-primary" data-action="reveal-team-voter">
						🔓 Estou com o aparelho - Votar
					</button>
					<button type="button" class="btn-secondary btn-sm" style="margin-top:10px" data-action="cancel-phase">
						Cancelar Votação
					</button>
				</div>
			`;
		}

		return `
			<div class="board-phase-panel pass-device-box">
				<span class="pass-badge">VOTO DE ${voterName.toUpperCase()}</span>
				<h3>Você aprova a equipe proposta para a Missão ${bs.currentRound}?</h3>
				<div class="vote-cards-row">
					<button type="button" class="vote-card-btn approve" data-action="cast-team-vote" data-vote="approve">
						<span class="vote-card-icon">✅</span>
						<span class="vote-card-title">APROVAR</span>
						<span class="vote-card-sub">Concordo com a equipe</span>
					</button>
					<button type="button" class="vote-card-btn reject" data-action="cast-team-vote" data-vote="reject">
						<span class="vote-card-icon">❌</span>
						<span class="vote-card-title">REJEITAR</span>
						<span class="vote-card-sub">Vetar esta equipe</span>
					</button>
				</div>
			</div>
		`;
	}

	renderTeamVoteSummaryPhase(bs) {
		const approvals = this.collectedTeamVotes.filter((v) => v.vote).length;
		const rejections = this.collectedTeamVotes.length - approvals;
		const approved = approvals > rejections; // Majority required

		return `
			<div class="board-phase-panel">
				<h3>📊 Resultado da Votação da Equipe</h3>
				<div class="vote-tally-header ${approved ? "approved" : "rejected"}">
					<h4>${approved ? "✅ EQUIPE APROVADA!" : "❌ EQUIPE REJEITADA!"}</h4>
					<p>${approvals} Aprovação(ões) × ${rejections} Rejeição(ões)</p>
				</div>
				<ul class="team-votes-breakdown">
					${this.collectedTeamVotes
						.map(
							(v) => `
						<li class="${v.vote ? "v-app" : "v-rej"}">
							<span>${v.playerName}</span>
							<strong>${v.vote ? "✅ Aprovou" : "❌ Rejeitou"}</strong>
						</li>
					`
						)
						.join("")}
				</ul>
				<button type="button" class="btn-primary" data-action="confirm-team-vote-tally" data-approved="${approved}">
					Confirmar e Continuar
				</button>
			</div>
		`;
	}

	renderMissionVotePassPhase(bs, currentRoundObj) {
		const totalRequired = currentRoundObj.teamSize;
		const currentVoteNum = this.collectedMissionVotes.length + 1;

		if (this.passPrivacyHidden) {
			return `
				<div class="board-phase-panel pass-device-box">
					<span class="pass-badge">🕵️ VOTAÇÃO ANÔNIMA DA MISSÃO (${currentVoteNum} de ${totalRequired})</span>
					<h3>Membro da Equipe #${currentVoteNum}</h3>
					<p>Passe o aparelho para o <strong>${currentVoteNum}º integrante</strong> da missão votar em segredo.</p>
					<button type="button" class="btn-primary" data-action="reveal-mission-voter">
						🔒 Votar em Segredo
					</button>
					<button type="button" class="btn-secondary btn-sm" style="margin-top:10px" data-action="cancel-phase">
						Cancelar Missão
					</button>
				</div>
			`;
		}

		return `
			<div class="board-phase-panel pass-device-box">
				<span class="pass-badge">VOTO SECRETO (${currentVoteNum} de ${totalRequired})</span>
				<h3>Escolha sua Carta de Missão</h3>
				<p class="info-text">Membros da Resistência DEVEM votar Sucesso. Espiões podem votar Sucesso ou Sabotar.</p>
				<div class="vote-cards-row">
					<button type="button" class="vote-card-btn success-card" data-action="cast-mission-vote" data-vote="success">
						<span class="vote-card-icon">🛡️</span>
						<span class="vote-card-title">SUCESSO</span>
						<span class="vote-card-sub">Cumprir a Missão</span>
					</button>
					<button type="button" class="vote-card-btn fail-card" data-action="cast-mission-vote" data-vote="fail">
						<span class="vote-card-icon">🗡️</span>
						<span class="vote-card-title">SABOTAR</span>
						<span class="vote-card-sub">Falhar a Missão</span>
					</button>
				</div>
			</div>
		`;
	}

	renderMissionRevealPhase(bs, currentRoundObj) {
		// Shuffle votes so order is 100% anonymous
		const shuffled = this.shuffledMissionVotes || GameManager.shuffleArray(this.collectedMissionVotes);
		this.shuffledMissionVotes = shuffled;

		const failsCount = shuffled.filter((v) => v === "fail").length;
		const successCount = shuffled.filter((v) => v === "success").length;
		const requiredFails = currentRoundObj.requiresTwoFails ? 2 : 1;
		const missionSucceeded = failsCount < requiredFails;

		return `
			<div class="board-phase-panel">
				<h3>🎴 Resultado Anônimo da Missão ${bs.currentRound}</h3>
				<p class="info-text">Cartas embaralhadas para garantir o anonimato total:</p>

				<div class="revealed-cards-grid">
					${shuffled
						.map(
							(v) => `
						<div class="revealed-mission-card ${v}">
							<span class="rm-icon">${v === "success" ? "🛡️" : "🗡️"}</span>
							<span class="rm-label">${v === "success" ? "SUCESSO" : "SABOTAGEM"}</span>
						</div>
					`
						)
						.join("")}
				</div>

				<div class="mission-verdict-banner ${missionSucceeded ? "res" : "spy"}">
					<h4>${
						missionSucceeded
							? "🛡️ MISSÃO CUMPRIDA! PONTO PARA A RESISTÊNCIA!"
							: "🗡️ MISSÃO SABOTADA! PONTO PARA OS ESPIÕES!"
					}</h4>
					<p>${successCount} Sucesso(s) • ${failsCount} Sabotagem(ns)</p>
				</div>

				<button type="button" class="btn-primary" data-action="finalize-mission-result" data-winner="${missionSucceeded ? "resistance" : "spy"}" data-fails="${failsCount}">
					Registrar no Tabuleiro e Avançar Rodada
				</button>
			</div>
		`;
	}

	renderLoyaltyCardModal(bs) {
		const card = this.lastLoyaltyCard;
		if (!card) return "";
		const isSwap = card.type === "swap";

		return `
			<div class="board-phase-panel loyalty-reveal-box ${isSwap ? "swap-alert" : "no-change"}">
				<span class="pass-badge">🃏 BARALHO DO DESERTOR - RODADA ${card.round}</span>
				<div class="loyalty-card-visual ${isSwap ? "swap" : "keep"}">
					<div class="lc-icon">${isSwap ? "🔄" : "🛡️"}</div>
					<h3>${card.title}</h3>
					<p>${card.subtitle}</p>
				</div>
				<p class="info-text">Cartas restantes no baralho do Desertor: <strong>${bs.loyaltyDeck.length}</strong></p>
				<button type="button" class="btn-primary" data-action="close-loyalty-modal">
					Entendido - Voltar ao Tabuleiro
				</button>
			</div>
		`;
	}

	renderMultiplayerClientPhase(bs, currentRoundObj) {
		// Rendered by multiplayer.js via custom hooks or synced state
		return `
			<div class="board-phase-panel">
				<p class="info-text" style="text-align:center;">Acompanhe o placar e aguarde o Líder / Host iniciar as votações desta rodada.</p>
			</div>
		`;
	}

	swapDesertorRolesIfPresent() {
		if (!this.roles) return false;
		const desertores = this.roles.filter((r) => r.isDesertor);
		if (desertores.length === 2) {
			desertores.forEach((d) => {
				if (d.faction === "resistance") {
					d.faction = "spy";
					d.key = "desertorEspiao";
					d.description =
						"🔄 SUA LEALDADE MUDOU! Agora você pertence aos ESPIÕES!";
				} else {
					d.faction = "resistance";
					d.key = "desertorResistencia";
					d.description =
						"🔄 SUA LEALDADE MUDOU! Agora você pertence à RESISTÊNCIA!";
				}
			});
			return true;
		}
		return false;
	}

	attachEvents() {
		const buttons = this.container.querySelectorAll("[data-action]");
		buttons.forEach((btn) => {
			btn.addEventListener("click", () => {
				const action = btn.dataset.action;
				this.handleAction(action, btn);
			});
		});
	}

	handleAction(action, btn) {
		const bs = this.boardState;
		const currentRoundObj = bs.rounds[bs.currentRound - 1] || bs.rounds[4];

		switch (action) {
			case "next-leader":
				bs.leaderIndex = (bs.leaderIndex + 1) % bs.playerCount;
				this.onStateChange(bs);
				this.render();
				break;

			case "quick-team-approve": {
				const res = GameManager.registerTeamVoteResult(bs, true);
				this.showBanner(res.message, "success");
				this.onStateChange(bs);
				break;
			}

			case "quick-team-reject": {
				const res = GameManager.registerTeamVoteResult(bs, false);
				this.showBanner(
					res.message,
					res.action === "five_rejections_point" ? "critical" : "warning"
				);
				this.onStateChange(bs);
				break;
			}

			case "start-pass-team-vote":
				this.activePhase = "team_vote_pass";
				this.passVoteIndex = 0;
				this.collectedTeamVotes = [];
				this.passPrivacyHidden = true;
				this.clearBanner();
				this.render();
				break;

			case "reveal-team-voter":
				this.passPrivacyHidden = false;
				this.render();
				break;

			case "cast-team-vote": {
				const isApprove = btn.dataset.vote === "approve";
				const voterName =
					bs.playerNames[this.passVoteIndex] ||
					`Jogador ${this.passVoteIndex + 1}`;
				this.collectedTeamVotes.push({
					playerName: voterName,
					vote: isApprove,
				});
				this.passVoteIndex++;
				this.passPrivacyHidden = true;

				if (this.passVoteIndex >= bs.playerCount) {
					this.activePhase = "team_vote_summary";
				}
				this.render();
				break;
			}

			case "confirm-team-vote-tally": {
				const approved = btn.dataset.approved === "true";
				this.activePhase = "overview";
				const res = GameManager.registerTeamVoteResult(bs, approved);
				this.showBanner(
					res.message,
					approved
						? "success"
						: res.action === "five_rejections_point"
						? "critical"
						: "warning"
				);
				this.onStateChange(bs);
				break;
			}

			case "start-mission-pass":
				this.activePhase = "mission_vote_pass";
				this.collectedMissionVotes = [];
				this.shuffledMissionVotes = null;
				this.passPrivacyHidden = true;
				this.clearBanner();
				this.render();
				break;

			case "reveal-mission-voter":
				this.passPrivacyHidden = false;
				this.render();
				break;

			case "cast-mission-vote": {
				const voteType = btn.dataset.vote; // 'success' | 'fail'
				this.collectedMissionVotes.push(voteType);
				this.passPrivacyHidden = true;

				if (this.collectedMissionVotes.length >= currentRoundObj.teamSize) {
					this.activePhase = "mission_reveal";
				}
				this.render();
				break;
			}

			case "finalize-mission-result": {
				const winner = btn.dataset.winner;
				const fails = parseInt(btn.dataset.fails || "0", 10);
				this.activePhase = "overview";
				GameManager.recordRoundOutcome(bs, winner, fails);
				this.showBanner(
					winner === "resistance"
						? "🛡️ Rodada vencida pela Resistência!"
						: "🗡️ Rodada sabotada pelos Espiões!",
					winner === "resistance" ? "success" : "critical"
				);
				this.onStateChange(bs);
				break;
			}

			case "manual-round-res":
				GameManager.recordRoundOutcome(bs, "resistance", 0, "Resultado registrado manualmente");
				this.showBanner("🛡️ Ponto registrado para a Resistência!", "success");
				this.onStateChange(bs);
				break;

			case "manual-round-spy":
				GameManager.recordRoundOutcome(bs, "spy", 1, "Resultado registrado manualmente");
				this.showBanner("🗡️ Ponto registrado para os Espiões!", "critical");
				this.onStateChange(bs);
				break;

			case "draw-desertor": {
				const card = GameManager.drawDesertorCard(bs);
				this.lastLoyaltyCard = card;
				if (card.type === "swap") {
					this.swapDesertorRolesIfPresent();
				}
				this.activePhase = "loyalty_card_modal";
				this.onStateChange(bs, { desertorCard: card });
				this.render();
				break;
			}

			case "close-loyalty-modal":
				this.activePhase = "overview";
				this.render();
				break;

			case "assassin-steal":
				bs.winner = "spy";
				bs.winReason =
					"🗡️ O Assassino identificou e eliminou o Comandante da Resistência!";
				this.onStateChange(bs);
				this.render();
				break;

			case "reset-board": {
				const fresh = GameManager.createBoardState(
					bs.playerCount,
					bs.hasDesertor,
					bs.playerNames
				);
				Object.assign(this.boardState, fresh);
				this.activePhase = "overview";
				this.selectedTeamIndices.clear();
				this.collectedTeamVotes = [];
				this.collectedMissionVotes = [];
				this.shuffledMissionVotes = null;
				this.lastLoyaltyCard = null;
				this.showBanner("🔄 Tabuleiro reiniciado para a 1ª Missão!", "info");
				this.onStateChange(this.boardState);
				this.render();
				break;
			}

			case "cancel-phase":
				this.activePhase = "overview";
				this.render();
				break;
		}
	}
}

window.BoardUIController = BoardUIController;
