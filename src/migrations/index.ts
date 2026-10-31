import * as migration_20261016_172531_initial from './20261016_172531_initial';
import * as migration_20261016_202722_media_source_url from './20261016_202722_media_source_url';
import * as migration_20261027_075328_remove_upcoming from './20261027_075328_remove_upcoming';
import * as migration_20261027_081433_add_reviews from './20261027_081433_add_reviews';
import * as migration_20261027_123636_media_storage_fields from './20261027_123636_media_storage_fields';
import * as migration_20261028_082554_shipping_defaults from './20261028_082554_shipping_defaults';
import * as migration_20261031_120000_facebook_instead_of_tiktok from './20261031_120000_facebook_instead_of_tiktok';

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
    name: '20261027_081433_add_reviews',
  },
  {
    up: migration_20261027_123636_media_storage_fields.up,
    down: migration_20261027_123636_media_storage_fields.down,
    name: '20261027_123636_media_storage_fields',
  },
  {
    up: migration_20261028_082554_shipping_defaults.up,
    down: migration_20261028_082554_shipping_defaults.down,
    name: '20261028_082554_shipping_defaults',
  },
  {
    up: migration_20261031_120000_facebook_instead_of_tiktok.up,
    down: migration_20261031_120000_facebook_instead_of_tiktok.down,
    name: '20261031_120000_facebook_instead_of_tiktok',
  },
];
