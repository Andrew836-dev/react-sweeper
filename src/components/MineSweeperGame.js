import { useCallback, useEffect, useState } from "react";
import { DIFFICULTY, EASY, HARD, MEDIUM, RESET, UPDATE_GRID, GAME_OVER, NEW_GAME } from "../util/actions";
import { createEmptyGrid } from "../util/hazardPlacement";
import MineSweeperGrid from "./MineSweeperGrid";
import MineSweeperOptions from "./MineSweeperMenu";
import "../sweeper.css";

function MineSweeperGame() {
  const [gridOptions, setGridOptions] = useState({ bombs: 10, dimensions: [8, 8] });
  const [grid, setGrid] = useState([]);
  const [gameStatus, setGameStatus] = useState({ inProgress: false, isGameOver: false });
  const [score, setScore] = useState({ revealed: 0, marked: 0 });
  const gameWon = useCallback(() => setGameFinished(), []);

  function setDifficulty(difficulty) {
    switch (difficulty) {
      case HARD:
        setGridOptions({ dimensions: [30, 15], bombs: 100 });
        break;
      case MEDIUM:
        setGridOptions({ dimensions: [15, 15], bombs: 64 });
        break;
      case EASY:
        setGridOptions({ dimensions: [8, 8], bombs: 10 })
        break;
      default:
        setDifficulty(EASY);
    }
  }

  function handleDispatch(action) {
    switch (action.type) {
      case NEW_GAME:
        setGrid(() => action.grid);
        setGameStatus(prevStatus => ({ ...prevStatus, inProgress: true }));
        break;
      case UPDATE_GRID:
        setGrid(() => action.grid);
        break;
      case GAME_OVER:
        setGameFinished();
        setGrid(() => action.grid);
        break;
      case DIFFICULTY:
        setDifficulty(action.value);
        break;
      case RESET:
        setGrid(() => createEmptyGrid(gridOptions.dimensions));
        setGameStatus(prevStatus => ({ ...prevStatus, inProgress: false, isGameOver: false }));
        break;
      default:
    }
  }

  function setGameFinished() {
    setGameStatus(prevStatus => ({ ...prevStatus, inProgress: false, isGameOver: true }));
  }

  useEffect(() => {
    setGrid(() => createEmptyGrid(gridOptions.dimensions));
    setGameStatus(prevStatus => ({ ...prevStatus, inProgress: false, isGameOver: false }));
  }, [gridOptions]);

  useEffect(() => {
    if (gameStatus.inProgress) {
      const marked = grid.reduce((total, square) => square.marked === 1 ? total + 1 : total, 0);
      const revealed = grid.reduce((total, square) => square.revealed ? total + 1 : total, 0);
      setScore(prevScore => ({ ...prevScore, marked, revealed }))
      if (revealed === (gridOptions.dimensions[0] * gridOptions.dimensions[1] - gridOptions.bombs)) gameWon();
    }
  }, [grid, gridOptions, gameStatus, gameWon])

  return (
    <div className="minesweeper">
      <div className="row">
        <MineSweeperOptions dispatch={handleDispatch} />
        {`${score.marked} bombs marked`}
      </div>
      <MineSweeperGrid gameStatus={gameStatus} gridOptions={gridOptions} dispatch={handleDispatch} grid={grid} />
    </div>
  );
}

export default MineSweeperGame;