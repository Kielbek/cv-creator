/**
 * Splits measured blocks into A4/Letter pages. Each column flows independently: when a column is full, its next
 * block continues in the same column on the next page (like a newspaper). A block is never split; a block taller
 * than a whole page gets a page of its own (and is clipped) - in practice only an extremely long description.
 */
export interface MeasuredBlock {
  key: string;
  height: number;
}

/**
 * @param columns     blocks per column, in order, with measured heights (px)
 * @param firstPage   usable height of each column on page 1 (smaller when a full-width header sits on top)
 * @param otherPages  usable height of a column on the following pages
 * @returns pages → columns → block keys
 */
export function paginate(columns: MeasuredBlock[][], firstPage: number[], otherPages: number): string[][][] {
  const perColumn = columns.map((blocks, c) => {
    const pages: string[][] = [[]];
    let used = 0;
    let capacity = firstPage[c] ?? otherPages;
    for (const b of blocks) {
      const page = pages[pages.length - 1];
      if (used + b.height > capacity + 0.5 && page.length > 0) {
        pages.push([b.key]);
        used = b.height;
        capacity = otherPages;
      } else if (used + b.height > capacity + 0.5 && page.length === 0 && pages.length === 1 && capacity < otherPages) {
        // does not even fit on the (shorter) first page: start on page 2
        pages.push([b.key]);
        used = b.height;
        capacity = otherPages;
      } else {
        page.push(b.key);
        used += b.height;
      }
    }
    return pages;
  });
  const count = Math.max(1, ...perColumn.map((p) => p.length));
  return Array.from({ length: count }, (_, p) => perColumn.map((col) => col[p] ?? []));
}
