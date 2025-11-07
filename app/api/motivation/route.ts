import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  try {
    const connection = await getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS motivation_quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        quote TEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if we need a new quote (older than 3 hours)
    const [rows] = await connection.execute(
      'SELECT * FROM motivation_quotes WHERE user_id = 1 AND generated_at > DATE_SUB(NOW(), INTERVAL 3 HOUR) ORDER BY generated_at DESC LIMIT 1'
    );
    
    const rowsArray = Array.isArray(rows) ? rows : [];
    if (rowsArray.length > 0) {
      releaseConnection(connection);
      return NextResponse.json({ quote: (rowsArray[0] as any).quote });
    }
    
    // Generate new quote
    const completion = await groq.chat.completions.create({
      messages: [{
        role: "system",
        content: "Generate a short, powerful motivational quote for UPSC CSE aspirants. Keep it under 100 characters and inspiring."
      }, {
        role: "user", 
        content: "Give me a motivational quote for UPSC preparation"
      }],
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      max_tokens: 50,
    });
    
    const quote = completion.choices[0]?.message?.content || "Success is the sum of small efforts repeated day in and day out.";
    
    await connection.execute(
      'INSERT INTO motivation_quotes (user_id, quote) VALUES (1, ?)',
      [quote]
    );
    releaseConnection(connection);
    
    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ quote: "Every expert was once a beginner. Keep going!" });
  }
}