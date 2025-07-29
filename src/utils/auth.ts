const ADMIN_EMAIL = "owseshell@gmail.com";

export const isAdminUser = (userEmail?: string | null): boolean => {
  return userEmail === ADMIN_EMAIL;
};

export const ADMIN_EMAIL_ADDRESS = ADMIN_EMAIL;