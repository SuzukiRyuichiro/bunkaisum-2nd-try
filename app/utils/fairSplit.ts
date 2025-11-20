export const fairSplit = (total: number, count: number) => {
  if (count <= 0 || total <= 0) {
    return [];
  }

  const base = Math.floor(total / count);
  const split = Array(count).fill(base);
  const remainder = base === 0 ? total : total % base;

  for (let i = 0; i < remainder; i += 1) {
    split[i] += 1;
  }

  return split;
};
