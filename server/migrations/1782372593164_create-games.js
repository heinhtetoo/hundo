exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('games', {
    id: {
      type: 'bigserial',
      primaryKey: true,
    },
    rawg_id: {
      type: 'integer',
      notNull: true,
      unique: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    cover_image_url: {
      type: 'text',
    },
    genres: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"),
    },
    platforms: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"),
    },
    release_year: {
      type: 'smallint',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('games');
};
