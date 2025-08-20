import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = 'tiwariadarsh0704@gmail.com';
const ADMIN_PASSWORD = 'Adarsh0704$$';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: true, 
        message: 'Authentication successful' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Authentication failed' 
    }, { status: 500 });
  }
}