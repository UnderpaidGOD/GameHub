/* Module Sandbox: UNO Extreme Engine */
(() => {
  let area;
  const unoColors = ["red", "blue", "green", "yellow"];
  const unoValues = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "Skip",
    "Rev",
    "+2",
    "WILD",
    "+4",
  ];

  const colorHex = {
    red: "#ff3333",
    blue: "#3399ff",
    green: "#2ecc71",
    yellow: "#f1c40f",
    black: "#222222",
  };

  let unoState = {};

  // 1. Initial Launch Window View
  function renderStartScreen() {
    if (!area) return;

    area.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-layers-half display-3 text-info mb-3"></i>
                <h3 class="text-white text-uppercase fw-900 mb-2">UNO: Extreme Match</h3>
                <p class="text-muted small mb-4 mx-auto" style="max-width: 340px;">
                    Initialize algorithmic deck arrays. Synthesize card-matching logic parameters against baseline AI profiles.
                </p>
                <button id="launch-uno-btn" class="btn btn-outline-info text-uppercase fw-bold px-5 py-3">
                    <i class="bi bi-terminal me-2"></i>Launch UNO Engine
                </button>
            </div>
        `;

    document.getElementById("launch-uno-btn").onclick = initGame;
  }

  // 2. Centralized State Initialization
  function initGame() {
    unoState = {
      player: [],
      ai: [],
      current: null,
      isPlayerTurn: true,
      gameOver: false,
      isProcessing: false,
      awaitingColorChoice: false,
      unoDeclared: false, // TRACKS IF PLAYER SAFELY DECLARED "UNO"
      pendingPenalty: false, // PASSES PENALTY STATES THROUGH WILD-PICKER SELECTION INTERCEPTS
    };

    // Deal opening hands
    for (let i = 0; i < 7; i++) {
      unoState.player.push(createCard());
      unoState.ai.push(createCard());
    }

    // Establish initial valid starting card
    unoState.current = createCard();
    while (unoState.current.color === "black") {
      unoState.current = createCard();
    }

    if (window.addLog) {
      window.addLog("UNO ENGINE INITIALIZED: Cards distributed. Your turn.");
    }
    renderUNOInternal();
  }

  // 3. Card Generator Factory
  function createCard() {
    const val = unoValues[Math.floor(Math.random() * unoValues.length)];
    const isWild = val === "WILD" || val === "+4";
    return {
      color: isWild ? "black" : unoColors[Math.floor(Math.random() * 4)],
      value: val,
    };
  }

  // 4. Main Render Pipeline
  function renderUNOInternal() {
    if (!area) return;
    area.innerHTML =
      "<h4 class='text-center mb-3 text-white text-uppercase fw-700 tracking-wide'>UNO Matrix Terminal</h4>";

    if (unoState.gameOver) {
      const playerWin = unoState.player.length === 0;
      const msg = playerWin
        ? "VICTORY! COMPUTER HAND EMPTIED."
        : "DEFEAT! AI SECURED MATRIX DOMINANCE.";
      const textClass = playerWin ? "text-success" : "text-danger";

      area.innerHTML += `
                <div class='text-center my-4 w-100'>
                    <h2 class='fw-900 ${textClass}'>${msg}</h2>
                    <button id='retry-uno-btn' class='btn btn-outline-warning mt-4 px-4 text-uppercase fw-bold'>Re-Initialize Deck</button>
                </div>
            `;
      document.getElementById("retry-uno-btn").onclick = initGame;
      return;
    }

    // Render Action Intercept: Player Wild Card Color Selection Screen
    if (unoState.awaitingColorChoice) {
      renderColorPickerUI();
      return;
    }

    // Discard & Arena Field View
    const board = document.createElement("div");
    board.className =
      "text-center mb-4 p-4 rounded w-100 max-width-md shadow-lg";
    const currentHex = colorHex[unoState.current.color];
    board.style.border = `3px solid ${currentHex}`;
    board.style.background = "rgba(0, 0, 0, 0.4)";
    board.style.boxShadow = `0 0 15px ${currentHex}44`;

    board.innerHTML = `
            <div class="small text-uppercase text-muted tracking-wider mb-2">Active Discard Pile</div>
            <div class="d-inline-flex align-items-center justify-content-center my-2 rounded shadow" 
                 style="background:${currentHex}; width:80px; height:120px; border:2px solid #fff; transform: rotate(-3deg);">
                <h3 class="text-white fw-900 text-shadow m-0">${unoState.current.value}</h3>
            </div>
            <div class="mt-3"><span class="badge bg-dark border border-secondary px-3 py-2">Hostile AI Hand Assets: ${unoState.ai.length}</span></div>
        `;
    area.appendChild(board);

    // Turn Indicator Banner
    const banner = document.createElement("p");
    banner.className = `text-center fw-bold small my-2 ${unoState.isPlayerTurn ? "text-info" : "text-warning"}`;
    banner.textContent = unoState.isPlayerTurn
      ? ">> YOUR TURN: Deploy asset card or execute standard Draw routine."
      : ">> AI SYSTEM CALCULATING OPTIMAL RESPONSE PATHWAY...";
    area.appendChild(banner);

    // Control Matrix Actions
    const controls = document.createElement("div");
    controls.className = "d-flex justify-content-center gap-3 mb-4 w-100";

    // Draw Card Button
    const drawBtn = document.createElement("button");
    drawBtn.className =
      "btn btn-sm btn-outline-info text-uppercase fw-bold px-4";
    drawBtn.innerHTML = "<i class='bi bi-plus-circle me-1'></i> Draw Card";
    drawBtn.disabled = !unoState.isPlayerTurn || unoState.isProcessing;
    drawBtn.onclick = executePlayerDraw;
    controls.appendChild(drawBtn);

    // NEW FEATURE: The Strategic "CALL UNO" Safety Trigger Component
    const unoBtn = document.createElement("button");
    unoBtn.className = "btn btn-sm text-uppercase fw-bold px-4 transition-all ";
    unoBtn.innerHTML =
      "<i class='bi bi-exclamation-triangle-fill me-1'></i> Call UNO";

    // Highlight and pulse the button exclusively when they hold exactly 2 cards
    if (
      unoState.player.length === 2 &&
      !unoState.unoDeclared &&
      unoState.isPlayerTurn
    ) {
      unoBtn.className +=
        "btn-danger animation-pulse shadow-danger border border-white";
      unoBtn.disabled = false;
    } else if (unoState.unoDeclared) {
      unoBtn.className +=
        "btn-success border border-success text-white opacity-75";
      unoBtn.innerHTML =
        "<i class='bi bi-check-circle-fill me-1'></i> UNO SECURED";
      unoBtn.disabled = true;
    } else {
      unoBtn.className += "btn-outline-secondary opacity-25";
      unoBtn.disabled = true;
    }

    unoBtn.onclick = () => {
      unoState.unoDeclared = true;
      if (window.addLog)
        window.addLog(
          "[SYSTEM] > UNO declared! Integrity shields active for final deployment.",
          "#2ecc71",
        );
      renderUNOInternal();
    };
    controls.appendChild(unoBtn);
    area.appendChild(controls);

    // Player Card Selection Deck Hand Container
    const hand = document.createElement("div");
    hand.className = "d-flex flex-wrap justify-content-center gap-2 mt-2 w-100";

    unoState.player.forEach((card, index) => {
      const b = document.createElement("button");
      b.className =
        "btn fw-bold text-white d-flex flex-column justify-content-between p-2 rounded tracking-tighter position-relative";
      b.style.width = "70px";
      b.style.height = "105px";
      b.style.backgroundColor = colorHex[card.color];
      b.style.border = "2px solid rgba(255,255,255,0.8)";
      b.style.transition = "all 0.2s ease";

      b.innerHTML = `
                <span class="small align-self-start text-shadow">${card.value}</span>
                <h4 class="text-shadow align-self-center my-auto fw-900">${card.value === "WILD" || card.value === "+4" ? "★" : card.value}</h4>
                <span class="small align-self-end text-shadow text-end">${card.value}</span>
            `;

      const canPlay =
        card.color === "black" ||
        card.color === unoState.current.color ||
        card.value === unoState.current.value;

      if (!unoState.isPlayerTurn || !canPlay || unoState.isProcessing) {
        b.style.opacity = "0.4";
        b.style.cursor = "not-allowed";
        b.style.transform = "scale(0.95)";
      } else {
        b.onmouseenter = () => {
          b.style.transform = "translateY(-8px) scale(1.05)";
          b.style.borderColor = "#00ffff";
        };
        b.onmouseleave = () => {
          b.style.transform = "none";
          b.style.borderColor = "rgba(255,255,255,0.8)";
        };
        b.onclick = () => initiateCardDeployment(index);
      }
      hand.appendChild(b);
    });
    area.appendChild(hand);
  }

  // 5. Advancement Feature: Dynamic Manual Color Selection UI Component
  function renderColorPickerUI() {
    const wrapper = document.createElement("div");
    wrapper.className = "text-center py-4 w-100 max-width-md";
    wrapper.innerHTML = `
            <h5 class="text-warning text-uppercase fw-bold mb-3"><i class="bi bi-palette me-2"></i>Select Wild Coordinate Color</h5>
            <p class="text-muted small mb-4">You have deployed a Wild card infrastructure. Re-route the active grid color variable:</p>
            <div id="color-picker-grid" class="d-grid gap-3 mx-auto" style="grid-template-columns: repeat(2, 1fr); max-width: 260px;"></div>
        `;
    area.appendChild(wrapper);

    const gridContainer = document.getElementById("color-picker-grid");
    unoColors.forEach((color) => {
      const btn = document.createElement("button");
      btn.className =
        "btn py-3 fw-bold text-uppercase text-white text-shadow rounded shadow";
      btn.style.backgroundColor = colorHex[color];
      btn.style.border = "2px solid #fff";
      btn.textContent = color;
      btn.onclick = () => resolvePlayerWildChoice(color);
      gridContainer.appendChild(btn);
    });
  }

  // 6. Interaction Pipeline Mechanics
  function executePlayerDraw() {
    if (!unoState.isPlayerTurn || unoState.isProcessing) return;

    unoState.isProcessing = true;
    unoState.unoDeclared = false; // Reset safe declaration status if hand size changes

    const newCard = createCard();
    unoState.player.push(newCard);

    if (window.addLog)
      window.addLog(
        `You drew a card: [${newCard.color.toUpperCase()} ${newCard.value}].`,
      );

    unoState.isPlayerTurn = false;
    renderUNOInternal();

    setTimeout(() => {
      unoState.isProcessing = false;
      aiTurn();
    }, 1000);
  }

  function initiateCardDeployment(index) {
    if (!unoState.isPlayerTurn || unoState.isProcessing) return;

    const card = unoState.player[index];
    let penaltyTriggered = false;

    // EVALUATION CRITERIA: Playing second to last card without declaring UNO
    if (unoState.player.length === 2 && !unoState.unoDeclared) {
      penaltyTriggered = true;
    }

    // Clean out declaration flag for next cycle states
    unoState.unoDeclared = false;

    if (card.color === "black") {
      unoState.awaitingColorChoice = true;
      unoState.player.splice(index, 1);
      unoState.current = card;
      unoState.pendingPenalty = penaltyTriggered; // Route through picker logic screen safely
      renderUNOInternal();
    } else {
      unoState.player.splice(index, 1);
      executeCardPayload(card, true, penaltyTriggered);
    }
  }

  function resolvePlayerWildChoice(chosenColor) {
    unoState.awaitingColorChoice = false;
    unoState.current.color = chosenColor;

    const penalty = unoState.pendingPenalty;
    unoState.pendingPenalty = false;

    if (window.addLog)
      window.addLog(
        `You adjusted the active deck color configuration to: [${chosenColor.toUpperCase()}].`,
      );
    executeCardPayload(unoState.current, true, penalty);
  }

  // 7. Core Rules Evaluation Logic Matrix
  function executeCardPayload(card, isPlayer, penaltyTriggered = false) {
    unoState.current = card;
    let nextTurn = !isPlayer;

    // Process UNO Check Failures before checking standard zero-card win boundaries
    if (isPlayer && penaltyTriggered) {
      const p1 = createCard();
      const p2 = createCard();
      unoState.player.push(p1, p2);
      if (window.addLog) {
        window.addLog(
          `[PENALTY] > Failed to Call UNO prior to playing second-to-last card! +2 files added to hand matrix.`,
          "#ff3333",
        );
      }
    }

    if (unoState.player.length === 0 || unoState.ai.length === 0) {
      unoState.gameOver = true;
      renderUNOInternal();
      return;
    }

    // Ability Card Execution Sequences
    if (card.value === "Skip" || card.value === "Rev") {
      nextTurn = isPlayer;
      if (window.addLog)
        window.addLog(
          `[ACTION] > ${isPlayer ? "Player" : "AI"} deployed Skip logic. Sub-routine execution bypassed.`,
        );
    } else if (card.value === "+2") {
      const target = isPlayer ? unoState.ai : unoState.player;
      target.push(createCard(), createCard());
      nextTurn = isPlayer;
      if (window.addLog)
        window.addLog(
          `[MODIFIER] > Draw +2 protocol initialized against ${isPlayer ? "AI" : "Player"}.`,
        );
    } else if (card.value === "+4") {
      const target = isPlayer ? unoState.ai : unoState.player;
      for (let i = 0; i < 4; i++) target.push(createCard());
      nextTurn = isPlayer;
      if (window.addLog)
        window.addLog(
          `[CRITICAL] > EXTREME DRAW +4 payload compiled against ${isPlayer ? "AI" : "Player"}.`,
        );
    } else {
      if (window.addLog)
        window.addLog(
          `${isPlayer ? "Player" : "AI"} deployed: [${card.color.toUpperCase()} ${card.value}].`,
        );
    }

    unoState.isPlayerTurn = nextTurn;
    renderUNOInternal();

    if (!unoState.isPlayerTurn) {
      unoState.isProcessing = true;
      setTimeout(() => {
        unoState.isProcessing = false;
        aiTurn();
      }, 1200);
    }
  }

  // 8. Refactored Smart AI Decisions Engine
  function aiTurn() {
    if (unoState.gameOver || unoState.isPlayerTurn) return;

    const playableIdx = unoState.ai.findIndex(
      (c) =>
        c.color === "black" ||
        c.color === unoState.current.color ||
        c.value === unoState.current.value,
    );

    if (playableIdx !== -1) {
      const card = unoState.ai[playableIdx];
      unoState.ai.splice(playableIdx, 1);

      // AI Smart Color Choice Evaluation
      if (card.color === "black") {
        const distribution = {};
        unoColors.forEach((col) => (distribution[col] = 0));
        unoState.ai.forEach((c) => {
          if (c.color !== "black") distribution[c.color]++;
        });

        let smartColor = unoColors[Math.floor(Math.random() * 4)];
        let maxCount = -1;
        for (const col in distribution) {
          if (distribution[col] > maxCount) {
            maxCount = distribution[col];
            smartColor = col;
          }
        }
        card.color = smartColor;
        if (window.addLog)
          window.addLog(
            `AI calibrated a Wild card deployment matrix color to: [${smartColor.toUpperCase()}].`,
          );
      }

      // Simple hidden simulation check for AI calling UNO to balance the log feed matches
      if (unoState.ai.length === 1 && window.addLog) {
        window.addLog(
          "[SYSTEM] > AI successfully established single card declaration code sequence.",
          "#2ecc71",
        );
      }

      executeCardPayload(card, false);
    } else {
      const newCard = createCard();
      unoState.ai.push(newCard);
      if (window.addLog)
        window.addLog(
          "AI found no logical asset card matches. Executed Draw sub-routine.",
        );

      unoState.isPlayerTurn = true;
      renderUNOInternal();
    }
  }

  // EXPOSE ONLY THIS MOUNT ENTRY POINT GLOBALLY TO THE PARENT WINDOW INTERFACE
  window.renderUNO = function () {
    area = document.getElementById("game-area");
    renderStartScreen();
  };
})();
