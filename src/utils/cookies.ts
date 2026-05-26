// Utility to fetch token and role from document.cookie on the client side
export const getTokenFromCookies = async (): Promise<{ token: string, role: string } | null> => {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split('; ').reduce((prev: any, current) => {
    const [name, value] = current.split('=');
    prev[name] = value;
    return prev;
  }, {});

  const token = cookies['auth_token'];
  const role = cookies['user_role'];

  if (token) {
    return { token, role: role || 'USER' };
  }

  return null;
};
