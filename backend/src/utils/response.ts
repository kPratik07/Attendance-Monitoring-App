export const ok = <T>(data: T, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const fail = (message: string, error?: unknown) => ({
  success: false,
  message,
  error,
});
