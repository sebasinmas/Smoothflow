/** Rango temporal cerrado-abierto para reglas de solapamiento de agenda. */
export function timeRangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function isWithinRange(point: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return point >= rangeStart && point <= rangeEnd;
}
