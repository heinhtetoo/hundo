exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType('backlog_status', [
    'backlog',
    'playing',
    'completed',
    'dropped',
    'wishlist',
  ]);

  pgm.createTable('backlog_entries', {
    id: {
      type: 'bigserial',
      primaryKey: true,
    },
    user_id: {
      type: 'bigint',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    game_id: {
      type: 'bigint',
      notNull: true,
      references: '"games"',
      onDelete: 'CASCADE',
    },
    status: {
      type: 'backlog_status',
      notNull: true,
      default: 'backlog',
    },
    rating: {
      type: 'smallint',
    },
    hours_played: {
      type: 'numeric(7,1)',
    },
    notes: {
      type: 'text',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.addConstraint(
    'backlog_entries',
    'backlog_entries_rating_check',
    'CHECK (rating >= 1 AND rating <= 10)',
  );

  pgm.addConstraint(
    'backlog_entries',
    'backlog_entries_user_game_unique',
    'UNIQUE (user_id, game_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('backlog_entries');
  pgm.dropType('backlog_status');
};
