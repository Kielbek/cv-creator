import { describe, expect, it } from 'vitest';
import { paginate } from './paginate';

const b = (key: string, height: number) => ({ key, height });

describe('paginate', () => {
  it('keeps everything on one page when it fits', () => {
    expect(paginate([[b('a', 100), b('b', 200)]], [500], 1000)).toEqual([[['a', 'b']]]);
  });

  it('moves the overflowing block to the next page, columns flow independently', () => {
    const pages = paginate([[b('s1', 300), b('s2', 300)], [b('m1', 400), b('m2', 400), b('m3', 400)]], [700, 700], 1000);
    expect(pages).toEqual([
      [['s1', 's2'], ['m1']],
      [[], ['m2', 'm3']],
    ]);
  });

  it('uses the larger capacity on following pages', () => {
    const pages = paginate([[b('a', 400), b('b', 400), b('c', 400)]], [500], 1000);
    expect(pages).toEqual([[['a']], [['b', 'c']]]);
  });

  it('gives an oversized block its own page instead of looping', () => {
    const pages = paginate([[b('a', 100), b('huge', 5000), b('c', 100)]], [1000], 1000);
    expect(pages).toEqual([[['a']], [['huge']], [['c']]]);
  });

  it('starts on page 2 when the first block does not fit under the header', () => {
    expect(paginate([[b('a', 800)]], [600], 1000)).toEqual([[[]], [['a']]]);
  });
});
