import type { MetadataRoute } from 'next';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { getGitaChapters } from '@/lib/gita';
import { SITE_URL } from '@/lib/seo';
import { rowToGod, rowToFestival, rowToVratham, rowToShloka, rowToStory, rowToPuja } from '@/lib/relations';

function url(path: string, priority: number, changeFreq: MetadataRoute.Sitemap[0]['changeFrequency'] = 'monthly') {
  return { url: `${SITE_URL}${path}`, priority, changeFrequency: changeFreq };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [gods, festivals, vrathams, shlokas, stories, pujas] = await Promise.all([
    getPublished(TABS.gods).catch(emptyOnError(TABS.gods, 'sitemap', [])),
    getPublished(TABS.festivals).catch(emptyOnError(TABS.festivals, 'sitemap', [])),
    getPublished(TABS.vrathams).catch(emptyOnError(TABS.vrathams, 'sitemap', [])),
    getPublished(TABS.shlokas).catch(emptyOnError(TABS.shlokas, 'sitemap', [])),
    getPublished(TABS.stories_index).catch(emptyOnError(TABS.stories_index, 'sitemap', [])),
    getPublished(TABS.pujas).catch(emptyOnError(TABS.pujas, 'sitemap', [])),
  ]);

  const staticPages = [
    url('/', 1.0, 'daily'),
    url('/gods', 0.9, 'weekly'),
    url('/festivals', 0.9, 'weekly'),
    url('/vrathams', 0.9, 'weekly'),
    url('/shlokas', 0.9, 'weekly'),
    url('/stories', 0.8, 'weekly'),
    url('/upcoming', 0.8, 'daily'),
    url('/panchangam', 0.7, 'daily'),
    url('/search', 0.6, 'monthly'),
    url('/pujas', 0.9, 'weekly'),
    url('/bhagavad-gita', 0.9, 'weekly'),
    url('/site-index', 0.5, 'monthly'),
  ];

  const gitaChapterPages = getGitaChapters().map(c =>
    url(`/bhagavad-gita/${c.number}`, 0.7, 'monthly')
  );
  const pujaPages = pujas.map(rowToPuja).map(p =>
    url(`/pujas/${p.slug}`, 0.8)
  );

  const godPages = gods.map(rowToGod).map(g =>
    url(`/gods/${g.slug}`, 0.8)
  );
  const festivalPages = festivals.map(rowToFestival).map(f =>
    url(`/festivals/${f.slug}`, 0.8)
  );
  const vrathamPages = vrathams.map(rowToVratham).map(v =>
    url(`/vrathams/${v.slug}`, 0.8)
  );
  const shlokaPages = shlokas.map(rowToShloka).map(s =>
    url(`/shlokas/${s.slug}`, 0.7)
  );
  const storyPages = stories.map(rowToStory).map(s =>
    url(`/stories/${s.slug}`, 0.7)
  );

  return [...staticPages, ...godPages, ...festivalPages, ...vrathamPages, ...shlokaPages, ...storyPages, ...pujaPages, ...gitaChapterPages];
}
