import gitaData from './data/bhagavad-gita.json';

export type GitaChapter = {
  number: number;
  name_en: string;
  name_te: string;
  name_ta: string;
  name_hi: string;
  verse_count: number;
};

export type GitaVerse = {
  chapter: number;
  verse: number;
  sanskrit: string;
  script_te: string;
  script_hi: string;
  script_ta: string;
  iast: string;
  meaning_en: string;
  meaning_te: string;
  meaning_ta: string;
  meaning_hi: string;
};

const data = gitaData as { chapters: GitaChapter[]; verses: GitaVerse[] };

export function getGitaChapters(): GitaChapter[] {
  return data.chapters;
}

export function getGitaChapter(number: number): GitaChapter | undefined {
  return data.chapters.find(c => c.number === number);
}

export function getGitaVersesByChapter(chapter: number): GitaVerse[] {
  return data.verses.filter(v => v.chapter === chapter);
}
