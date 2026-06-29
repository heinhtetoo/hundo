exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('users', {
    email_verified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });

  pgm.sql('UPDATE users SET email_verified = true');

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
};

exports.down = (pgm) => {
  pgm.dropTable('auth_tokens');
  pgm.dropColumn('users', 'email_verified');
};
