/* Module Sandbox: Battleship Engine */
(() => {
  // These variables are now completely private to game3.js and won't conflict with game1, 2, or 4
  let area, logContainer;
  let shipState = {};

  // 1. Initial Launch Window View
  function renderStartScreen() {
    if (!area) return;

    area.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-target display-3 text-danger mb-3"></i>
                <h3 class="text-white text-uppercase fw-900 mb-2">Battleship: Tactical Matrix</h3>
                <p class="text-muted small mb-4 mx-auto" style="max-width: 340px;">
                    Establish secure link to local naval theatre. Authorization required to deploy fleet assets.
                </p>
                <button id="launch-matrix-btn" class="btn btn-outline-danger text-uppercase fw-bold px-5 py-3">
                    <i class="bi bi-terminal me-2"></i>Launch Battleship
                </button>
            </div>
        `;

    document.getElementById("launch-matrix-btn").onclick = initGame;
  }

  // 2. Centralized State Initialization
  function initGame() {
    shipState = {
      player: [],
      enemy: [],
      playerHits: Array(25).fill(0),
      aiHits: Array(25).fill(0),
      placing: true,
      gameOver: false,
      isAiTurn: false,
    };

    // Hooks safely into the central engine's log system
    if (window.addLog) {
      window.addLog("BATTLESHIP SYSTEM ONLINE: Awaiting deployment matrix.");
    }
    renderBattleshipInternal();
  }

  // 3. Main Render Pipeline
  function renderBattleshipInternal() {
    if (!area) return;
    area.innerHTML =
      "<h4 class='text-center mb-4 text-white text-uppercase fw-700 tracking-wide'>Battleship Operational Command</h4>";

    if (shipState.gameOver) {
      const playerWin = shipState.enemy.every(
        (idx) => shipState.playerHits[idx],
      );
      const msg = playerWin
        ? "VICTORY! ALL HOSTILE TARGETS NEUTRALIZED."
        : "DEFEAT! YOUR FLEET HAS BEEN ELIMINATED.";
      const textClass = playerWin ? "text-info" : "text-danger";

      area.innerHTML += `
                <div class='text-center my-4 w-100'>
                    <h2 class='fw-900 ${textClass}'>${msg}</h2>
                    <button id='retry-btn' class='btn btn-outline-info mt-4 px-4 text-uppercase fw-bold'>Re-Deploy Fleet</button>
                </div>
            `;
      document.getElementById("retry-btn").onclick = initGame;
      return;
    }

    if (shipState.placing) {
      area.innerHTML +=
        "<p class='text-center text-warning small mb-3'>Select 3 grid tiles to assign your naval assets.</p>";
      const centerWrapper = document.createElement("div");
      centerWrapper.className = "d-flex justify-content-center w-100";
      centerWrapper.appendChild(createGrid("player"));
      area.appendChild(centerWrapper);
    } else {
      area.innerHTML +=
        "<p class='text-center text-info small mb-4'>Target matrix localized. Select coordinates to fire.</p>";

      const row = document.createElement("div");
      row.className = "row g-4 justify-content-center text-center w-100";

      const playerCol = document.createElement("div");
      playerCol.className =
        "col-12 col-md-6 d-flex flex-column align-items-center";
      playerCol.innerHTML =
        "<h6 class='text-uppercase small mb-2 text-muted'>Defensive Grid (Your Fleet)</h6>";
      playerCol.appendChild(createGrid("player"));

      const enemyCol = document.createElement("div");
      enemyCol.className =
        "col-12 col-md-6 d-flex flex-column align-items-center";
      enemyCol.innerHTML =
        "<h6 class='text-uppercase small mb-2 text-danger'>Offensive Matrix (Enemy Waters)</h6>";
      enemyCol.appendChild(createGrid("enemy"));

      row.appendChild(playerCol);
      row.appendChild(enemyCol);
      area.appendChild(row);
    }
  }

  // 4. Grid Generator Matrix
  function createGrid(type) {
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(5, 50px)";
    grid.style.gap = "6px";

    for (let i = 0; i < 25; i++) {
      const b = document.createElement("button");
      b.style.width = "50px";
      b.style.height = "50px";
      b.style.fontSize = "18px";
      b.style.padding = "0";
      b.style.background = "rgba(0, 0, 0, 0.6)";
      b.style.border = "1px solid rgba(0, 255, 255, 0.3)";
      b.style.color = "#ffffff";
      b.style.cursor = "pointer";
      b.style.transition = "all 0.2s ease";

      b.onmouseenter = () => {
        if (!b.disabled) b.style.borderColor = "#ff00bf";
      };
      b.onmouseleave = () => {
        if (!b.disabled) b.style.borderColor = "rgba(0, 255, 255, 0.3)";
      };

      if (type === "player") {
        if (shipState.player.includes(i)) {
          b.textContent = "🚢";
          b.style.borderColor = "#00ffff";
        }
        if (shipState.aiHits[i]) {
          const isHit = shipState.player.includes(i);
          b.textContent = isHit ? "💥" : "🌊";
          b.style.background = isHit
            ? "rgba(255, 0, 191, 0.2)"
            : "rgba(0, 255, 255, 0.05)";
          b.style.borderColor = isHit ? "#ff00bf" : "rgba(0, 255, 255, 0.2)";
        }
        if (shipState.placing) {
          b.onclick = () => handleAttack(i);
        } else {
          b.disabled = true;
          b.style.cursor = "default";
        }
      } else if (type === "enemy") {
        if (shipState.playerHits[i]) {
          const isHit = shipState.enemy.includes(i);
          b.textContent = isHit ? "💥" : "🌊";
          b.style.background = isHit
            ? "rgba(255, 0, 191, 0.2)"
            : "rgba(0, 255, 255, 0.05)";
          b.style.borderColor = isHit ? "#ff00bf" : "rgba(0, 255, 255, 0.2)";
          b.disabled = true;
          b.style.cursor = "default";
        } else {
          b.onclick = () => handleAttack(i);
        }
      }

      grid.appendChild(b);
    }
    return grid;
  }

  // 5. Fire Systems Logic
  function handleAttack(i) {
    if (shipState.gameOver || shipState.isAiTurn) return;

    if (shipState.placing) {
      if (!shipState.player.includes(i) && shipState.player.length < 3) {
        shipState.player.push(i);
        if (window.addLog) window.addLog(`Vessel mapped to sector [${i}].`);

        if (shipState.player.length === 3) {
          shipState.placing = false;
          while (shipState.enemy.length < 3) {
            let r = Math.floor(Math.random() * 25);
            if (!shipState.enemy.includes(r)) shipState.enemy.push(r);
          }
          if (window.addLog)
            window.addLog("WARNING: Hostile fleet detected. Open fire!");
        }
        renderBattleshipInternal();
      }
    } else {
      if (!shipState.playerHits[i]) {
        shipState.playerHits[i] = 1;

        if (shipState.enemy.includes(i)) {
          if (window.addLog)
            window.addLog(`HIT: Hostile target compromised at sector [${i}].`);
        } else {
          if (window.addLog)
            window.addLog(`MISS: Kinetic round lost at coordinate [${i}].`);
        }

        if (checkWin()) return;

        shipState.isAiTurn = true;
        renderBattleshipInternal();
        setTimeout(aiTurn, 800);
      }
    }
  }

  // 6. AI Turn Logic
  function aiTurn() {
    if (shipState.gameOver) return;

    let options = [];
    for (let i = 0; i < 25; i++) {
      if (!shipState.aiHits[i]) options.push(i);
    }

    if (options.length > 0) {
      const choice = options[Math.floor(Math.random() * options.length)];
      shipState.aiHits[choice] = 1;

      if (shipState.player.includes(choice)) {
        if (window.addLog)
          window.addLog(
            `ALERT: Structural damage sustained at asset sector [${choice}]!`,
          );
      } else {
        if (window.addLog)
          window.addLog(`EVASION: Enemy round missed asset deployment zone.`);
      }
    }

    shipState.isAiTurn = false;
    if (!checkWin()) renderBattleshipInternal();
  }

  // 7. Win Evaluation
  function checkWin() {
    const enemySunk = shipState.enemy.every((idx) => shipState.playerHits[idx]);
    const playerSunk = shipState.player.every((idx) => shipState.aiHits[idx]);

    if (enemySunk || playerSunk) {
      shipState.gameOver = true;
      renderBattleshipInternal();
      return true;
    }
    return false;
  }

  // EXPOSE ONLY THIS FUNCTION GLOBALLY TO THE WINDOW OBJECT
  window.renderBattleship = function () {
    area = document.getElementById("game-area");
    logContainer = document.getElementById("game-log");
    renderStartScreen();
  };
})();
