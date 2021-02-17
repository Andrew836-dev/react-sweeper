import { CLICK_SQUARE, MARK_SQUARE } from "../util/actions";
function MineSweeperSquare({ squareData: { value, revealed, marked }, squareIndex, gameStatus, dispatch }) {
  const bomb = "*";
  const marker = "M";
  const question = "?";

  function generateClassNamefromProps() {
    if (value === -2) return "bomb";
    if (revealed && value >= 0) return `nearby-${value} revealed`;
    if (gameStatus.isGameOver && marked > 0) {
      if (value < 0) return "correct";
      return "incorrect";
    }
    return "";
  }
  return <button
    onClick={(event) => dispatch(event, { type: CLICK_SQUARE, value: squareIndex })}
    onContextMenu={event => dispatch(event, { type: MARK_SQUARE, value: squareIndex })}
    className={"gridSquare " + generateClassNamefromProps()}
    disabled={gameStatus.isGameOver}
  >
    {revealed && value > 0 && value}
    {revealed && value < 0 && (marked === 0 ? bomb : marker)}
    {!revealed && marked > 0 && (marked === 1 ? marker : question)}
  </button>
}

export default MineSweeperSquare;