export const fairSplit = (total: number, participantIds: number[]) => {
  if (participantIds.length === 0) {
    return;
  }

  const count = participantIds.length;

  const base = Math.floor(total / count);
  const split = new Map(participantIds.map((id) => [id, base]));
  const remainder = total - base * participantIds.length;

  for (let i = 0; i < remainder; i += 1) {
    split.set(participantIds[i]!, split.get(participantIds[i]!)! + 1);
  }

  return split;
};
