import { CLICK_SQUARE, GAME_OVER, MARK_SQUARE, UPDATE_GRID, NEW_GAME } from "../util/actions";
import { chainReveal } from "../util/reveal";
import { randomBombLocationsExcluding, createEmptyGrid, countBombsAround } from "../util/hazardPlacement";
import MineSweeperSquare from "./MineSweeperSquare";

function MineSweeperGrid({ gridOptions, gameStatus, dispatch, grid }) {

  function revealSquare(clickedSquare, grid, { dimensions }, { inProgress }) {
    const currentGrid = inProgress ? grid : createGrid(clickedSquare, gridOptions)
    const dispatchType = inProgress ? UPDATE_GRID : NEW_GAME;
    if (currentGrid[clickedSquare].revealed) return;
    if (currentGrid[clickedSquare].marked === 1) return;
    if (currentGrid[clickedSquare].value === -1) return gameOver(clickedSquare);
    const safeSquares = chainReveal(clickedSquare, Array.from(currentGrid), dimensions);
    dispatch({ type: dispatchType, grid: currentGrid.map((square, i) => safeSquares.includes(i) ? { ...square, revealed: true } : square) });
  }

  function markSquare(clickedSquare, grid) {
    if (grid[clickedSquare].revealed) return;
    const newMarking = grid[clickedSquare].marked + 1;
    dispatch({ type: UPDATE_GRID, grid: grid.map((square, squareIndex) => squareIndex === clickedSquare ? { ...square, marked: newMarking < 3 ? newMarking : 0 } : square) })
  }

  function createGrid(clickedSquare, gridOptions) {
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

  function gameOver(clickedSquare) {
    dispatch({ type: GAME_OVER, grid: grid.map((square, i) => square.value < 0 ? (i === clickedSquare ? { ...square, value: -2, marked: 0, revealed: true } : { ...square, revealed: true }) : square) })
  }

  function handleDispatch(event, action) {
    event.preventDefault();
    const { inProgress, isGameOver } = gameStatus;
    switch (action.type) {
      case CLICK_SQUARE:
        revealSquare(action.value, grid, gridOptions, gameStatus);
        break;
      case MARK_SQUARE:
        if (!isGameOver && inProgress) markSquare(action.value, grid);
        break;
      default:
    }
  }
  return <div className="gridContainer">
    {grid.length > 0 && Array.from(" ".repeat(gridOptions.dimensions[1])).map((_row, rowIndex) => (
      <div key={`row${rowIndex}`} className="row">
        {grid.slice(rowIndex * gridOptions.dimensions[0], (rowIndex + 1) * gridOptions.dimensions[0])
          .map((squareData, squareIndex) => (
            <MineSweeperSquare
              key={`row${rowIndex} column${squareIndex}`}
              dispatch={handleDispatch}
              squareData={squareData}
              squareIndex={squareIndex + (rowIndex * gridOptions.dimensions[0])}
              gameStatus={gameStatus}
            />
          ))}
      </div>)
    )}
  </div>
}

export default MineSweeperGrid;