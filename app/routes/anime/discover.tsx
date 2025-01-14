import { useLoaderData, useLocation, Link } from '@remix-run/react';
import { json, LoaderFunction, DataFunctionArgs, MetaFunction } from '@remix-run/node';
import { Container } from '@nextui-org/react';
import { motion } from 'framer-motion';

import { IMedia } from '~/types/media';
import { authenticate } from '~/services/supabase';
import { getAnimeAdvancedSearch } from '~/services/consumet/anilist/anilist.server';

import MediaList from '~/src/components/media/MediaList';

type LoaderData = {
  items: Awaited<ReturnType<typeof getAnimeAdvancedSearch>>;
};

export const meta: MetaFunction = () => ({
  title: 'Discover and watch anime for free | Sora',
  description:
    'Official Sora website to watch anime online HD for free, Watch TV show & TV series and Download all anime FREE',
  keywords:
    'watch free anime, free anime to watch online, watch anime online free, free anime streaming, free anime full, free anime download, watch anime hd, anime to watch',
  'og:url': 'https://sora-anime.vercel.app/anime/discover',
  'og:title': 'Discover and watch anime for free | Sora',
  'og:description':
    'Official Sora website to watch anime online HD for free, Watch TV show & TV series and Download all anime FREE',
});

export const loader: LoaderFunction = async ({ request }: DataFunctionArgs) => {
  await authenticate(request);

  const url = new URL(request.url);
  let page = Number(url.searchParams.get('page'));
  if (!page && (page < 1 || page > 1000)) page = 1;
  const query = url.searchParams.get('query') || undefined;
  const type = (url.searchParams.get('type') as 'ANIME' | 'MANGA') || 'ANIME';
  const season =
    (url.searchParams.get('season') as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL') || undefined;
  const format =
    (url.searchParams.get('format') as
      | 'TV'
      | 'TV_SHORT'
      | 'OVA'
      | 'ONA'
      | 'MOVIE'
      | 'SPECIAL'
      | 'MUSIC') || undefined;
  const sort = url.searchParams.get('sort')?.split(',') || undefined;
  const status =
    (url.searchParams.get('status') as
      | 'RELEASING'
      | 'NOT_YET_RELEASED'
      | 'FINISHED'
      | 'CANCELLED'
      | 'HIATUS') || undefined;
  const genres = url.searchParams.get('genres')?.split(',') || undefined;
  const id = url.searchParams.get('id') || undefined;
  const year = Number(url.searchParams.get('number')) || undefined;

  return json<LoaderData>({
    items: await getAnimeAdvancedSearch(
      query,
      type,
      page,
      20,
      season,
      format,
      sort,
      genres,
      id,
      year,
      status,
    ),
  });
};

export const handle = {
  breadcrumb: () => (
    <Link to="/anime/discover" aria-label="Discover Anime">
      Discover Anime
    </Link>
  ),
};

const DiscoverAnime = () => {
  const { items } = useLoaderData<LoaderData>();
  const location = useLocation();

  return (
    <motion.div
      key={location.key}
      initial={{ x: '-10%', opacity: 0 }}
      animate={{ x: '0', opacity: 1 }}
      exit={{ y: '-10%', opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container
        fluid
        display="flex"
        justify="center"
        direction="column"
        alignItems="center"
        css={{
          '@xsMax': {
            paddingLeft: '$sm',
            paddingRight: '$sm',
          },
        }}
      >
        {items && items.results && items.results.length > 0 && (
          <MediaList
            hasNextPage={items.hasNextPage || false}
            items={items.results as IMedia[]}
            itemsType="anime"
            listName="Discover Anime"
            listType="grid"
            loadingType="scroll"
            routeName={location.pathname}
            virtual
          />
        )}
      </Container>
    </motion.div>
  );
};

export default DiscoverAnime;
