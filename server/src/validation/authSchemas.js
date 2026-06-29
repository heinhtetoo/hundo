const { z } = require('zod');

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

const resendSchema = z.object({
  email: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
