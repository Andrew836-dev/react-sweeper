export function chainReveal(originSquare, grid, [gridWidth]) {
  const safeSquares = []
  const squaresToCheck = [originSquare];
  while (squaresToCheck.length) {
    const nextSquare = squaresToCheck.pop();
    if (shouldCheckAround(nextSquare, safeSquares, grid)) continue;
    if (grid[nextSquare].value === 0) getSquaresAround(nextSquare, gridWidth, grid).forEach(newSquare => squaresToCheck.push(newSquare));
    grid[nextSquare].revealed = true;
    safeSquares.push(nextSquare);
  }
  return safeSquares;
}

export function shouldCheckAround(squareIndex, safeSquares, grid) {
  return safeSquares.includes(squareIndex) || grid[squareIndex].revealed || grid[squareIndex].marked === 1;
}

export function getSquaresAround(square, gridWidth, gridArray) {
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