export interface Application {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thoughts: Thought[];
  applications: Application[];  // Applications using this agent
  createdAt: string;
}

export interface Thought {
  id: string;
  content: string;
  createdAt: string;
  agentId: string;
}

// Type for creating a new application
export interface CreateApplicationDto {
  name: string;
  description: string;
  agentIds: string[];  // IDs of agents to associate with
}

// Type for creating a new agent
export interface CreateAgentDto {
  name: string;
  description: string;
  prompt: string;
  applicationIds?: string[];  // Optional IDs of applications to associate with
}

// Type for adding a thought
export interface CreateThoughtDto {
  content: string;
  agentId: string;
} 