import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  password: string;
}

const users = new Map<string, AuthUser>();

export function findUser(username: string) {
  return users.get(username);
}

export function findUserByEmail(email: string) {
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
}

export async function createUser(username: string, email: string, password: string) {
  const user: AuthUser = {
    id: crypto.randomUUID(),
    username,
    email,
    password: await bcrypt.hash(password, 12),
  };

  users.set(username, user);
  return user;
}