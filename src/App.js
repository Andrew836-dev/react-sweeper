import { useState, useEffect, useCallback } from "react";
import "./sweeper.css";

function App() {
  const [gridOptions, setGridOptions] = useState({ bombs: 10, dimensions: [8, 8] });
  const [grid, setGrid] = useState([]);
  const [gameStatus, setGameStatus] = useState({ inProgress: false, isGameOver: false });
  const bomb = "*";
  const marker = "M";
  const question = "?";

  const createEmptyGrid = useCallback(([gridWidth, gridHeight]) => Array.from("0".repeat(gridWidth * gridHeight)).map(() => ({ revealed: false, value: 0, marked: 0 })), []);

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

  function setDifficulty(difficulty) {
    switch (difficulty) {
      case "Hard":
        setGridOptions({ dimensions: [30, 15], bombs: 100 });
        break;
      case "Medium":
        setGridOptions({ dimensions: [15, 15], bombs: 64 });
        break;
      case "Easy":
      default:
        setGridOptions({ dimensions: [8, 8], bombs: 10 })
    }
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
      case "difficulty":
        setDifficulty(value);
      default:
        break;
    }
  }

  function startGame(clickedSquare) {
    revealSquare(clickedSquare, createGrid(clickedSquare));
    setGameStatus(prevStatus => ({ ...prevStatus, inProgress: true }));
  }

  function handleGridRightClick(event, clickedSquare, { inProgress, isGameOver }, grid) {
    event.preventDefault();
    if (!isGameOver && inProgress) markSquare(clickedSquare, grid);
  }

  function handleGridClick(clickedSquare, { inProgress }, grid) {
    if (!inProgress) {
      startGame(clickedSquare);
    } else {
      revealSquare(clickedSquare, grid);
    }
  }

  function markSquare(clickedSquare) {
    if (grid[clickedSquare].revealed) return;
    const newMarking = grid[clickedSquare].marked + 1;
    setGrid(prevGrid => prevGrid.map((square, squareIndex) => squareIndex === clickedSquare ? { ...square, marked: newMarking < 3 ? newMarking : 0 } : square));
  }

  function revealSquare(clickedSquare, grid) {
    if (grid[clickedSquare].revealed) return;
    if (grid[clickedSquare].marked === 1) return;
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
      if (safeSquares.includes(nextSquare) || grid[nextSquare].revealed || grid[nextSquare].marked > 0) continue;
      if (grid[nextSquare].value === 0) getSquaresAround(nextSquare, gridOptions.dimensions[0], grid).forEach(newSquare => squaresToCheck.push(newSquare));
      grid[nextSquare].revealed = true;
      safeSquares.push(nextSquare);
    }
    return safeSquares;
  }

  function resetGame() {
    setGrid(() => createEmptyGrid(gridOptions.dimensions));
    setGameStatus(prevStatus => ({ ...prevStatus, inProgress: false, isGameOver: false }));
  }

  function gameOver(clickedSquare) {
    setGrid(prevGrid => prevGrid.map((square, i) => square.value < 0 ? (i === clickedSquare ? { ...square, value: -2, revealed: true } : { ...square, revealed: true }) : square));
    setGameStatus(prevStatus => ({ ...prevStatus, inProgress: false, isGameOver: true }));
  }

  useEffect(() => {
    setGrid(createEmptyGrid(gridOptions.dimensions));
  }, [createEmptyGrid, gridOptions]);

  return (
    <div className="App">
      <select name="difficulty" onChange={handleOptionsChange}>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
      <button onClick={resetGame}>Reset</button>
      <div className="gridContainer">
        {grid.length > 0 && Array.from(" ".repeat(gridOptions.dimensions[1])).map((_row, rowIndex) => (
          <div key={`row${rowIndex}`} className="row">
            {grid.slice(rowIndex * gridOptions.dimensions[0], (rowIndex + 1) * gridOptions.dimensions[0])
              .map((squareData, squareIndex) => (
                <button
                  key={`row${rowIndex} column${squareIndex}`}
                  className={`${squareData.revealed ? `${squareData.value === -1 ? `${gameStatus.isGameOver && squareData.marked > 0 && squareData.value < 0 && "correct"}` : `${squareData.value === -2 ? "bomb" : `nearby-${squareData.value}`} revealed`}` : `${gameStatus.isGameOver && squareData.marked > 0 && "incorrect"}`}`}
                  onContextMenu={(event) => handleGridRightClick(event, (squareIndex + (rowIndex * gridOptions.dimensions[0])), gameStatus, grid)}
                  onClick={() => handleGridClick((squareIndex + (rowIndex * gridOptions.dimensions[0])), gameStatus, grid)}
                  disabled={gameStatus.isGameOver}
                  value={squareIndex + rowIndex * gridOptions.dimensions[0]}
                >
                  {squareData.revealed && squareData.value > 0 && squareData.value}
                  {squareData.revealed && squareData.value < 0 && (squareData.marked === 0 ? bomb : marker)}
                  {!squareData.revealed && (squareData.marked > 0 && (squareData.marked === 1 ? marker : question))}
                </button>
              ))}
          </div>)
        )}
      </div>
    </div>
  );
}

export default App;
