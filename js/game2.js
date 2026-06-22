const boardState = {
  board: Array(64).fill(0),
  selected: null,
  validMoves: [],
  isPlayerTurn: true,
  gameOver: false,
};

// -------------------- RENDER --------------------
function renderCheckers() {
  area.innerHTML = "<h4>Checkers: Battle Edition</h4>";

  if (boardState.gameOver) {
    const msg = boardState.board.some((v) => v === 1 || v === 3)
      ? "YOU WIN!"
      : "YOU LOSE!";
    area.innerHTML += `<h2 class='text-center mt-4 ${msg === "YOU WIN!" ? "text-success" : "text-danger"}'>${msg}</h2>`;

    const btn = document.createElement("button");
    btn.className = "btn btn-info mt-3 w-100";
    btn.textContent = "Restart Game";
    btn.onclick = () => {
      boardState.board = Array(64).fill(0);
      boardState.gameOver = false;
      boardState.selected = null;
      boardState.validMoves = [];
      boardState.isPlayerTurn = true;
      renderCheckers();
    };

    area.appendChild(btn);
    return;
  }

  const board = document.createElement("div");
  board.style.display = "grid";
  board.style.gridTemplateColumns = "repeat(8, 45px)";
  board.style.border = "5px solid #333";
  board.style.margin = "0 auto";

  // initial setup
  if (boardState.board.every((v) => v === 0)) {
    for (let i = 0; i < 64; i++) {
      let row = Math.floor(i / 8),
        col = i % 8;
      if ((row + col) % 2 !== 0) {
        if (row < 3) boardState.board[i] = 1;
        else if (row > 4) boardState.board[i] = 2;
      }
    }
  }

  const forcedCaptureExists = getAllMoves().some((m) => m.captive !== null);

  boardState.board.forEach((v, i) => {
    const cell = document.createElement("div");

    cell.style.width = "45px";
    cell.style.height = "45px";
    cell.style.display = "flex";
    cell.style.alignItems = "center";
    cell.style.justifyContent = "center";
    cell.style.fontSize = "26px";

    const row = Math.floor(i / 8);
    const col = i % 8;
    cell.style.background = (row + col) % 2 ? "#222" : "#444";

    if (boardState.selected === i) cell.style.background = "#550";

    const moveInfo = boardState.validMoves.find((m) => m.target === i);
    if (moveInfo) {
      const dot = document.createElement("div");
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.borderRadius = "50%";
      dot.style.background = moveInfo.captive !== null ? "#ff4444" : "#44ff44";
      cell.appendChild(dot);
    }

    if (v === 1) cell.textContent = "🔴";
    else if (v === 2) cell.textContent = "⚫";
    else if (v === 3) cell.textContent = "👑";
    else if (v === 4) cell.textContent = "🎓";

    cell.onclick = () => handleCellClick(i, forcedCaptureExists);

    board.appendChild(cell);
  });

  area.appendChild(board);
}

// -------------------- INPUT --------------------
function handleCellClick(i, forcedCaptureExists) {
  if (!boardState.isPlayerTurn || boardState.gameOver) return;

  const piece = boardState.board[i];
  const moveChoice = boardState.validMoves.find((m) => m.target === i);

  // select piece
  if (piece === 1 || piece === 3) {
    const moves = getCalculatedMoves(i);

    boardState.selected = i;
    boardState.validMoves = forcedCaptureExists
      ? moves.filter((m) => m.captive !== null)
      : moves;

    renderCheckers();
    return;
  }

  // execute move
  if (moveChoice) {
    executeMove(boardState.selected, moveChoice);

    // chain capture logic
    if (moveChoice.captive !== null) {
      const further = getCalculatedMoves(moveChoice.target).filter(
        (m) => m.captive !== null,
      );

      if (further.length > 0) {
        boardState.selected = moveChoice.target;
        boardState.validMoves = further;
        renderCheckers();
        return;
      }
    }

    boardState.selected = null;
    boardState.validMoves = [];
    boardState.isPlayerTurn = false;

    checkGameOver();
    if (!boardState.gameOver) {
      setTimeout(aiMove, 600);
    }

    renderCheckers();
    return;
  }

  // deselect
  boardState.selected = null;
  boardState.validMoves = [];
  renderCheckers();
}

// -------------------- MOVES --------------------
function getCalculatedMoves(index) {
  const moves = [];
  const type = boardState.board[index];
  const isKing = type === 3 || type === 4;
  const isRed = type === 1 || type === 3;

  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const filtered = isKing
    ? directions
    : isRed
      ? [
          [1, 1],
          [1, -1],
        ]
      : [
          [-1, 1],
          [-1, -1],
        ];

  filtered.forEach((d) => {
    let r = Math.floor(index / 8) + d[0];
    let c = (index % 8) + d[1];
    let target = r * 8 + c;

    if (r < 0 || r > 7 || c < 0 || c > 7) return;

    const occupant = boardState.board[target];

    if (occupant === 0) {
      moves.push({ target, captive: null });
    } else {
      const isRedPiece = isRed;
      const isOpponent = isRedPiece
        ? occupant === 2 || occupant === 4
        : occupant === 1 || occupant === 3;

      if (isOpponent) {
        let jr = r + d[0];
        let jc = c + d[1];
        let jt = jr * 8 + jc;

        if (
          jr >= 0 &&
          jr < 8 &&
          jc >= 0 &&
          jc < 8 &&
          boardState.board[jt] === 0
        ) {
          moves.push({ target: jt, captive: target });
        }
      }
    }
  });

  return moves;
}

// -------------------- EXECUTE --------------------
function executeMove(from, moveObj) {
  const piece = boardState.board[from];

  boardState.board[moveObj.target] = piece;
  boardState.board[from] = 0;

  if (moveObj.captive !== null) {
    boardState.board[moveObj.captive] = 0;
  }

  const row = Math.floor(moveObj.target / 8);

  if (piece === 1 && row === 7) boardState.board[moveObj.target] = 3;
  if (piece === 2 && row === 0) boardState.board[moveObj.target] = 4;
}

// -------------------- AI --------------------
function aiMove() {
  const actions = [];

  boardState.board.forEach((v, i) => {
    if (v === 2 || v === 4) {
      getCalculatedMoves(i).forEach((m) => {
        actions.push({ from: i, move: m });
      });
    }
  });

  if (actions.length === 0) {
    boardState.gameOver = true;
    renderCheckers();
    return;
  }

  actions.sort((a, b) => scoreMove(b) - scoreMove(a));
  const action = actions[0];

  executeMove(action.from, action.move);

  boardState.isPlayerTurn = true;
  checkGameOver();
  renderCheckers();
}

// -------------------- AI SCORING --------------------
function scoreMove(action) {
  let score = 0;

  if (action.move.captive !== null) score += 10;

  const targetRow = Math.floor(action.move.target / 8);
  if (boardState.board[action.from] === 2 && targetRow === 0) score += 8;

  score += Math.random();

  return score;
}

// -------------------- UTIL --------------------
function getAllMoves() {
  let all = [];

  boardState.board.forEach((v, i) => {
    if (v === 1 || v === 3) {
      all.push(...getCalculatedMoves(i));
    }
  });

  return all;
}

function checkGameOver() {
  const red = boardState.board.some((v) => v === 1 || v === 3);
  const black = boardState.board.some((v) => v === 2 || v === 4);

  if (!red || !black) boardState.gameOver = true;
}
