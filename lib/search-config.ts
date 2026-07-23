// Shared Fuse.js options for SearchBar and SearchPage — keep both in sync.
export const searchFuseOptions = {
  threshold: 0.35,
  minMatchCharLength: 2,
  keys: [
    { name: 'name_en', weight: 0.4 },
    { name: 'name_te', weight: 0.2 },
    { name: 'name_ta', weight: 0.2 },
    { name: 'name_hi', weight: 0.1 },
    { name: 'name_sa', weight: 0.05 },
    { name: 'alternate_names', weight: 0.05 },
  ],
};
