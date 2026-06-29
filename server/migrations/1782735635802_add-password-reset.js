exports.up = (pgm) => {
  pgm.addColumn('users', {
    password_changed_at: { type: 'timestamptz' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'password_changed_at');
};
