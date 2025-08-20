import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedInsights } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { progressData } = await request.json();
    const insights = await getPersonalizedInsights(progressData);
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json({ 
      insights: 'AI insights are temporarily unavailable. Please try again later.' 
    });
  }
}