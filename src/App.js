import { useState, useEffect, useCallback } from "react";
function App() {
  const [gridOptions, setGridOptions] = useState({ bombs: 10, dimensions: [10, 10] });
  const [grid, setGrid] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const createEmptyGrid = useCallback(([gridWidth, gridHeight]) => Array.from("0".repeat(gridWidth * gridHeight)).map(() => ({ revealed: false, value: 0 })), []);

  function createGrid(clickedSquare) {
    const { dimensions: gridSizes, bombs: bombQuantity } = gridOptions;
    const newGrid = createEmptyGrid(gridSizes);
    const [gridWidth, gridHeight] = gridSizes;

    randomBombLocationsExcluding(bombQuantity, gridWidth * gridHeight, clickedSquare).forEach(bombLocation => newGrid[bombLocation].value = -1);

    newGrid.forEach((square, i) => {
      if (square.value < 0) return;
      newGrid[i].value = countBombsAround(i, gridWidth, newGrid);
    });
    return newGrid;
  }


  function countBombsAround(square, gridWidth, gridArray) {
    return getSquaresAround(square, gridWidth, gridArray).reduce((prev, curr) => (gridArray[curr].value < 0 ? prev + 1 : prev), 0);
  }

  function getSquaresAround(square, gridWidth, gridArray) {
    const output = [];
    const offsets = [-1, 0, 1];
    offsets.forEach(offsetY => {
      offsets.forEach(offsetX => {
        let targetIndex = square + ((gridWidth * offsetY) + offsetX);

        if (offsetY === 0 && offsetY === offsetX) return;                     // ignore the origin square (0,0)
        if (targetIndex < 0 || targetIndex >= gridArray.length) return;       // ignore values outside the array range
        if (square % gridWidth === 0 && offsetX === -1) return;               // ignore values to the left if checking the left column
        if (square % gridWidth === (gridWidth - 1) && offsetX === 1) return;  // ignore values to the right if checking the right column

        output.push(targetIndex);
      });
    });
    return output;
  }

  function randomBombLocationsExcluding(bombQuantity, totalGridArea, excludedSquare) {
    const locations = [];
    for (let i = 0; i < bombQuantity; i++) {
      let location = -1;
      while (locations.includes(location) || location < 0 || location === excludedSquare) {
        location = Math.floor(Math.random() * totalGridArea);
      }
      locations.push(location);
    }
    return locations;
  }

  function handleOptionsChange(event) {
    event.preventDefault();
    const { name, value } = event.target;
    switch (name) {
      case "bombs":
        setGridOptions(prevOptions => ({ ...prevOptions, bombs: parseInt(value) }));
        break;
      case "gridSize":
        setGridOptions(prevOptions => ({ ...prevOptions, dimensions: value.split("x").map(character => parseInt(character)) }));
        break;
      default:
        break;
    }
  }

  function startGame(clickedSquare) {
    revealSquare(clickedSquare, createGrid(clickedSquare));
    setInProgress(() => true);
  }

  function handleGridClick(clickedSquare, inProgress, grid) {
    if (!inProgress) {
      startGame(clickedSquare);
    } else {
      revealSquare(clickedSquare, grid);
    }
  }

  function revealSquare(clickedSquare, grid) {
    if (grid[clickedSquare].revealed) return;
    switch (grid[clickedSquare].value) {
      case 0:
        const safeSquares = chainReveal(clickedSquare, Array.from(grid));
        setGrid(grid.map((square, i) => safeSquares.includes(i) ? { ...square, revealed: true } : square));
        break;
      case -1:
        return gameOver(clickedSquare);
      default:
        setGrid(grid.map((square, i) => i === clickedSquare ? { ...square, revealed: true } : square));
    }
  }

  function chainReveal(originSquare, grid) {
    const safeSquares = [originSquare]
    grid[originSquare].revealed = true;
    const squaresToCheck = getSquaresAround(originSquare, gridOptions.dimensions[0], grid);
    while (squaresToCheck.length) {
      const nextSquare = squaresToCheck.pop();
      if (safeSquares.includes(nextSquare) || grid[nextSquare].revealed) continue;
      if (grid[nextSquare].value === 0) getSquaresAround(nextSquare, gridOptions.dimensions[0], grid).forEach(newSquare => squaresToCheck.push(newSquare));
      grid[nextSquare].revealed = true;
      safeSquares.push(nextSquare);
    }
    return safeSquares;
  }
  function gameOver(clickedSquare) {
    setGrid(prevGrid => prevGrid.map((square, i) => square.value < 0 ? (i === clickedSquare ? { value: -2, revealed: true } : { ...square, revealed: true }) : square));
    setInProgress(() => false);
    setIsGameOver(() => true);
  }

  useEffect(() => {
    setGrid(createEmptyGrid(gridOptions.dimensions));
    setInProgress(false);
    setIsGameOver(false);
  }, [createEmptyGrid, gridOptions]);

  const gridContainerStyle = {
    display: "flex", flexWrap: "wrap", width: `${gridOptions.dimensions[0] * 20}px`, height: `${gridOptions.dimensions[1] * 20}px`
  }

  const gridButtonStyle = {
    minWidth: "20px",
    minHeight: "20px",
    width: `${100 / gridOptions.dimensions[0]}%`,
    height: `${100 / gridOptions.dimensions[1]}%`,
    padding: "0",
    boxSizing: "border-box",
    textAlign: "center"
  }

  const colorChart = {
    unrevealed: "lightgray",
    "-2": "red",
    "-1": "lightgray",
    "0": "limegreen",
    "1": "yellow",
    "2": "green",
    "3": "blue",
    "4": "purple"
  }

  return (
    <div className="App">
      <select name="bombs" onChange={handleOptionsChange}>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="99">99</option>
      </select>
      <select name="gridSize" onChange={handleOptionsChange}>
        <option value="10x10">10x10</option>
        <option value="20x10">20x10</option>
        <option value="40x10">40x10</option>
      </select>
      <div style={gridContainerStyle}>
        {grid.length > 0 && grid.map((squareData, squareIndex, grid) => (
          <button
            key={squareIndex}
            className={!squareData.revealed ? "unrevealed" : `revealed${squareData.value > 0 ? ` ${squareData.value}` : squareData.value === -2 ? " bomb" : ""}`}
            style={{ ...gridButtonStyle, backgroundColor: squareData.revealed ? colorChart[squareData.value] : colorChart.unrevealed, border: squareData.revealed ? "1px solid gray" : "2px outset white" }}
            onClick={() => handleGridClick(squareIndex, inProgress, grid)}
            disabled={isGameOver}
          >
            {squareData.revealed && (squareData.value < 0 ? "*" : (squareData.value > 0 ? squareData.value : ""))}
          </button>)
        )}</div>
    </div>
  );
}

export default App;
