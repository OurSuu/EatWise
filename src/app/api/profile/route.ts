import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [session.user.email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = userRes.rows[0];
    
    // Map DB column names to frontend camelCase
    const mappedUser = {
      ...user,
      defaultLocation: user.default_location
    };

    return NextResponse.json(mappedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { gender, age, height, weight, lifestyle, targets, defaultLocation } = body;

    const parsedAge = age ? parseInt(age, 10) : null;
    const parsedHeight = height ? parseFloat(height) : null;
    const parsedWeight = weight ? parseFloat(weight) : null;
    const jsonTargets = JSON.stringify(targets || []);

    const res = await pool.query(
      `UPDATE users 
       SET gender=$1, age=$2, height=$3, weight=$4, lifestyle=$5, targets=$6, default_location=$7, updated_at=CURRENT_TIMESTAMP 
       WHERE email=$8 RETURNING *`,
      [gender, parsedAge, parsedHeight, parsedWeight, lifestyle, jsonTargets, defaultLocation, session.user.email]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = res.rows[0];
    const mappedUser = {
      ...user,
      defaultLocation: user.default_location
    };

    return NextResponse.json(mappedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
