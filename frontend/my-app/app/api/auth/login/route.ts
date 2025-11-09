import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Auth service error:', fetchError);
      
      // Check if auth service is not running
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch failed')) {
        return NextResponse.json(
          { message: 'Authentication service is unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Login failed';
      return NextResponse.json(
        { message: errorMessage },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}