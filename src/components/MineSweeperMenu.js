import { RESET, DIFFICULTY, EASY, MEDIUM, HARD } from "../util/actions";

function MineSweeperMenu({ dispatch }) {
  return <>
    <select name="difficulty" onChange={event => dispatch({ type: DIFFICULTY, value: event.target.value })}>
      <option value={EASY}>Easy</option>
      <option value={MEDIUM}>Medium</option>
      <option value={HARD}>Hard</option>
    </select>
    <button onClick={() => dispatch({ type: RESET })}>Reset</button>
  </>
}

export default MineSweeperMenu;