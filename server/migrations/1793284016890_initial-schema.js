exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'bigserial',
      primaryKey: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    email_verified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    password_changed_at: {
      type: 'timestamptz',
    },
  });

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

  pgm.createTable('auth_tokens', {
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
    type: {
      type: 'text',
      notNull: true,
    },
    token_hash: {
      type: 'text',
      notNull: true,
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('auth_tokens', ['user_id', 'type']);
  pgm.createIndex('auth_tokens', 'token_hash');

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
  pgm.dropTable('auth_tokens');
  pgm.dropTable('backlog_entries');
  pgm.dropType('backlog_status');
  pgm.dropTable('games');
  pgm.dropTable('users');
};
