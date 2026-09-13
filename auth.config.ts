import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findUser } from '@/lib/auth-users';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          throw new Error('Username and password are required');
        }

        const user = findUser(credentials.username as string);

        if (!user) {
          throw new Error('Invalid username or password');
        }

        const passwordMatched = await bcrypt.compare(credentials.password as string, user.password);

        if (!passwordMatched) {
          throw new Error('Invalid username or password');
        }

        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
};
