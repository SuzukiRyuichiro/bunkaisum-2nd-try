const sum = (numbers: number[]): number => {
  return numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
};

export const ratioSplit = (total: number, ratio: number[]) => {
  if (ratio.length === 0 || total <= 0) {
    return [];
  }

  const base = total / sum(ratio);

  const split = ratio.map((element) => Math.floor(element * base));

  const difference = total - sum(split);

  for (let i = 0; i < split.length && i < difference; i += 1) {
    const curr = split[i];
    if (curr == undefined) continue;

    split[i] = curr + 1;
  }

  return split;
};
