function adminPassword(): string {
  if (process.env.LOCAL === 'true') return 'Orangehrm@2026';
  const base = process.env.BASE_URL || '';
  // Default + self-hosted targets use the install-time password.
  // Legacy public demo (admin123) only via explicit BASE_URL override.
  if (base === '' || /onrender\.com|localhost|127\.0\.0\.1/.test(base)) return 'Orangehrm@2026';
  return 'admin123';
}

export const CREDENTIALS = {
  admin: {
    username: 'Admin',
    password: adminPassword(),
  },
};
