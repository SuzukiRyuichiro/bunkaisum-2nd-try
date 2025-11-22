const sum = (numbers: number[]): number => {
  return numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
};

// Ratio goes in as map of key being the user id and value being the ratio value
// In return, we get map of key being the user id and value being the amount in the right ratio
export const ratioSplit = (total: number, ratio: Map<number, number>) => {
  const participantIds = Array.from(ratio.keys());

  const count = sum(Array.from(ratio.values()));

  const base = Math.floor(total / count);
  const split = new Map(participantIds.map((id) => [id, base * ratio.get(id)]));
  const remainder = total - base * count;

  const participantCount = participantIds.length;
  for (let i = 0; i < remainder; i += 1) {
    split.set(
      participantIds[i % participantCount]!,
      split.get(participantIds[i % participantCount]!)! + 1
    );
  }

  return split;
};
