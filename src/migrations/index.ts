import * as migration_20261016_172531_initial from './20261016_172531_initial';
import * as migration_20261016_202722_media_source_url from './20261016_202722_media_source_url';
import * as migration_20261027_075328_remove_upcoming from './20261027_075328_remove_upcoming';
import * as migration_20261027_081433_add_reviews from './20261027_081433_add_reviews';

export const migrations = [
  {
    up: migration_20261016_172531_initial.up,
    down: migration_20261016_172531_initial.down,
    name: '20261016_172531_initial',
  },
  {
    up: migration_20261016_202722_media_source_url.up,
    down: migration_20261016_202722_media_source_url.down,
    name: '20261016_202722_media_source_url',
  },
  {
    up: migration_20261027_075328_remove_upcoming.up,
    down: migration_20261027_075328_remove_upcoming.down,
    name: '20261027_075328_remove_upcoming',
  },
  {
    up: migration_20261027_081433_add_reviews.up,
    down: migration_20261027_081433_add_reviews.down,
    name: '20261027_081433_add_reviews'
  },
];
