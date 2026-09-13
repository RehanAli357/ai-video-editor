import { NextResponse } from 'next/server';
import { createUser, findUser, findUserByEmail } from '@/lib/auth-users';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const existingUser = findUser(username) ?? findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            existingUser.username === username ? 'Username already exists' : 'Email already exists',
        },
        { status: 409 }
      );
    }

    await createUser(username, email, password);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
