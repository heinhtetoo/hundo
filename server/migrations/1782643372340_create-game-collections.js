exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('game_collections', {
    slug: {
      type: 'text',
      primaryKey: true,
    },
    title: {
      type: 'text',
      notNull: true,
    },
    payload: {
      type: 'jsonb',
      notNull: true,
    },
    refreshed_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('game_collections');
};
