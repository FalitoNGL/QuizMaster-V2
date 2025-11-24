// src/utils/adminConfig.js

export const ADMIN_EMAILS = [
  "falitoeriano17@gmail.com", // Pastikan huruf kecil semua di sini
];

export const isAdmin = (email) => {
  if (!email) return false;
  // Ubah email yang login menjadi huruf kecil sebelum dicek
  return ADMIN_EMAILS.includes(email.toLowerCase());
};