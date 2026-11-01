/**
 * Photos used on the landing page. Unsplash License: free for commercial use, no attribution required
 * (https://unsplash.com/license). Loaded from the Unsplash CDN; to self-host, download them into
 * public/images/home/ and replace the URLs with '/images/home/<name>.jpg'.
 */
const u = (id: string, w = 900, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=80`;

export const HOME_PHOTOS = {
  hero: u('1573496359142-b8d87734a5a2', 900, 1100),
  people: [
    { src: u('1580489944761-15a19d654956', 600, 750), role: 'marketing' },
    { src: u('1507003211169-0a1dd7228f2d', 600, 750), role: 'it' },
    { src: u('1494790108377-be9c29b29330', 600, 750), role: 'sales' },
    { src: u('1472099645785-5658abf4ff4e', 600, 750), role: 'finance' },
  ],
  work: u('1522202176988-66273c2fd55f', 1200, 900),
  team: u('1600880292203-757bb62b4baf', 1600, 900),
  portrait2: u('1560250097-0b93528c311a', 700, 900),
};
