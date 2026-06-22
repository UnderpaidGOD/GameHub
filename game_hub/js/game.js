const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

const lightState = {
  grid: Array(TILE_COUNT).fill(0),
  solved: false,
};

function renderLight() {
  area.innerHTML = `
        <h4>Light Puzzle</h4>
        <p class="small">Turn all tiles yellow!</p>
    `;

  const grid = document.createElement("div");
  grid.className = "light-grid";

  lightState.grid.forEach((value, index) => {
    const button = document.createElement("button");

    button.className = "btn btn-dark light-tile";
    button.textContent = value ? "🟡" : "⚫";

    button.onclick = () => {
      toggle(index);
      renderLight();
    };

    grid.appendChild(button);
  });

  area.appendChild(grid);
}

function toggle(index) {
  function flip(tileIndex) {
    if (tileIndex >= 0 && tileIndex < TILE_COUNT) {
      lightState.grid[tileIndex] = lightState.grid[tileIndex] === 1 ? 0 : 1;
    }
  }

  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  flip(index);

  if (row > 0) flip(index - GRID_SIZE); // Up
  if (row < GRID_SIZE - 1) flip(index + GRID_SIZE); // Down
  if (col > 0) flip(index - 1); // Left
  if (col < GRID_SIZE - 1) flip(index + 1); // Right

  if (!lightState.solved && lightState.grid.every((value) => value === 1)) {
    lightState.solved = true;
    addLog("LIGHT PUZZLE SOLVED!");
  }
}
