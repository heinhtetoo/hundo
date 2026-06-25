const { z } = require('zod');

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

module.exports = { registerSchema, loginSchema };
