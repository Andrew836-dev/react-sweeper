import { getSquaresAround } from "./reveal";

export function randomBombLocationsExcluding(bombQuantity, totalGridArea, excludedSquare) {
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

export function countBombsAround(square, gridWidth, gridArray) {
  return getSquaresAround(square, gridWidth, gridArray).reduce((prev, curr) => (gridArray[curr].value < 0 ? prev + 1 : prev), 0);
}

export function createEmptyGrid([gridWidth, gridHeight]) { return Array.from("0".repeat(gridWidth * gridHeight)).map(() => ({ revealed: false, value: 0, marked: 0 })); }