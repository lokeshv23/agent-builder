import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/agents.json');

async function readAgentsFile() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { agents: [] };
  }
}

async function writeAgentsFile(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await readAgentsFile();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const newAgent = await request.json();
  const data = await readAgentsFile();
  
  data.agents.push(newAgent);
  await writeAgentsFile(data);
  
  return NextResponse.json(newAgent);
} 