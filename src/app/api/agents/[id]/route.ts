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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updatedAgent = await request.json();
  const data = await readAgentsFile();
  
  const index = data.agents.findIndex((agent: any) => agent.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  
  data.agents[index] = updatedAgent;
  await writeAgentsFile(data);
  
  return NextResponse.json(updatedAgent);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await readAgentsFile();
  
  const index = data.agents.findIndex((agent: any) => agent.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  
  data.agents.splice(index, 1);
  await writeAgentsFile(data);
  
  return NextResponse.json({ success: true });
} 