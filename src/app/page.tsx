'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Settings, Users, Plus, MessageSquare } from 'lucide-react';
import { Langfuse } from 'langfuse';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
} from "@/components/ui/Card";

import {
  Agent,
  Application,
  Thought,
  CreateAgentDto,
  CreateApplicationDto,
  CreateThoughtDto,
} from "@/types";

// Initialize Langfuse client
const langfuse = new Langfuse({
  publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.NEXT_PUBLIC_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_LANGFUSE_BASE_URL // optional
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function HomePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [newThought, setNewThought] = useState('');
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeView, setActiveView] = useState<'dashboard' | 'agents' | 'applications'>('dashboard');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data.agents);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const handleCreateAgent = async () => {
    if (!agentName.trim() || !agentDescription.trim() || !agentPrompt.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newAgent: CreateAgentDto = {
      name: agentName,
      description: agentDescription,
      prompt: agentPrompt,
    };

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgent)
      });

      if (response.ok) {
        try {
          const createdAgent: Agent = await response.json();
          const trace = await langfuse.trace({
            id: createdAgent.id,
            name: `Agent Creation - ${createdAgent.name}`,
            userId: 'system',
            metadata: {
              agentId: createdAgent.id,
              description: createdAgent.description
            }
          });

          await trace.generation({
            name: "Initial Prompt Creation",
            model: "custom-agent",
            input: createdAgent.prompt,
            output: "Agent prompt created successfully",
            metadata: {
              agentName: createdAgent.name,
              timestamp: createdAgent.createdAt
            }
          });

        } catch (langfuseError) {
          console.error('Error logging to Langfuse:', langfuseError);
        }

        await loadAgents();
        setShowCreateForm(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to create agent'}`);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    }
  };

  const handleAddThought = async () => {
    if (!selectedAgent || !newThought.trim()) return;

    const thoughtDto: CreateThoughtDto = {
      content: newThought,
      agentId: selectedAgent.id
    };

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}/thoughts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thoughtDto)
      });

      if (response.ok) {
        await loadAgents();
        setNewThought('');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
    }
  };

  const resetForm = () => {
    setAgentName('');
    setAgentDescription('');
    setAgentPrompt('');
  };

  const handleGetStarted = () => {
    setActiveNav('agents');
    setActiveView('agents');
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-48 min-w-[12rem] border-r flex flex-col bg-gray-50">
          <div className="p-3 border-b bg-white">
            <h1 className="text-lg font-semibold">Agent Companion</h1>
          </div>
          
          <nav className="flex-1 py-2 overflow-y-auto">
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-3 font-normal ${
                  activeNav === 'dashboard' ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  setActiveNav('dashboard');
                  setActiveView('dashboard');
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-3 font-normal ${
                  activeNav === 'applications' ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  setActiveNav('applications');
                  setActiveView('applications');
                }}
              >
                Applications
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-3 font-normal ${
                  activeNav === 'agents' ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  setActiveNav('agents');
                  setActiveView('agents');
                }}
              >
                Agents
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-3 font-normal ${
                  activeNav === 'settings' ? 'bg-gray-100' : ''
                }`}
                onClick={() => setActiveNav('settings')}
              >
                Settings
              </Button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto relative">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {activeView !== 'dashboard' && (
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-4">
                <h1 className="text-xl md:text-2xl font-semibold">
                  {activeView === 'agents' && showCreateForm ? 'Build Agent' : 'Agent Companion'}
                </h1>
                {activeView === 'agents' && !showCreateForm && (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-[#14141F] text-white hover:bg-[#14141F]/90"
                  >
                    + New Agent
                  </Button>
                )}
              </div>
            )}

            {activeView === 'dashboard' && (
              <>
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                  <Card className="p-4 md:p-6">
                    <CardHeader className="p-0">
                      <CardTitle className="text-lg md:text-xl mb-2">Create Agents</CardTitle>
                      <CardDescription className="text-gray-600">
                        Build custom AI agents with specific capabilities and behaviors.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                      <Button 
                        onClick={handleGetStarted}
                        variant="outline" 
                        className="w-full"
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="p-4 md:p-6">
                    <CardHeader className="p-0">
                      <CardTitle className="text-lg md:text-xl mb-2">Create Applications</CardTitle>
                      <CardDescription className="text-gray-600">
                        Build and deploy custom applications powered by your AI agents.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                      >
                        Create App
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Agents Section */}
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-4">Recent Agents</h2>
                  <Card className="p-4 md:p-6">
                    {agents.length > 0 ? (
                      <div className="space-y-4">
                        {agents.slice(0, 5).map((agent) => (
                          <div 
                            key={agent.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="min-w-0 flex-1 mr-4">
                              <h3 className="font-medium truncate">{agent.name}</h3>
                              <p className="text-sm text-gray-500 truncate">{agent.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setShowCreateForm(false);
                              }}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        No agents created yet. Get started by creating your first agent.
                      </div>
                    )}
                  </Card>
                </div>
              </>
            )}

            {activeView === 'agents' && (
              <div className="space-y-6">
                {showCreateForm ? (
                  <div className="space-y-4 max-w-3xl">
                    <Card className="border-0 shadow-none">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-lg md:text-xl">Build Agent</CardTitle>
                      </CardHeader>
                      <CardContent className="px-0 space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Agent Name</label>
                          <Input 
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            placeholder="Enter agent name"
                            className="max-w-md w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Description</label>
                          <Input
                            value={agentDescription}
                            onChange={(e) => setAgentDescription(e.target.value)}
                            placeholder="Brief description"
                            className="max-w-md w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Agent Prompt</label>
                          <Textarea
                            value={agentPrompt}
                            onChange={(e) => setAgentPrompt(e.target.value)}
                            placeholder="Enter the agent's initial instructions or prompt"
                            rows={4}
                            className="resize-none max-w-2xl w-full"
                          />
                        </div>
                        <div className="pt-2">
                          <Button onClick={handleCreateAgent} size="sm">
                            Create Agent
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : selectedAgent ? (
                  <div className="space-y-4 max-w-3xl">
                    <Card className="border-0 shadow-none">
                      <CardHeader className="px-0 pt-0 pb-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <CardTitle className="text-lg md:text-xl">{selectedAgent.name}</CardTitle>
                          <span className="text-sm text-gray-500">
                            Created {formatDate(selectedAgent.createdAt)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 space-y-6">
                        <div>
                          <label className="text-sm font-medium block mb-1">Description</label>
                          <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">Prompt</label>
                          <div className="bg-gray-50 p-3 rounded text-sm max-w-2xl">
                            {selectedAgent.prompt}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Thoughts</label>
                            <span className="text-xs text-gray-500">
                              {selectedAgent.thoughts.length} entries
                            </span>
                          </div>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {selectedAgent.thoughts.map((thought, index) => (
                              <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                {thought.content}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-3 max-w-2xl">
                            <Input
                              value={newThought}
                              onChange={(e) => setNewThought(e.target.value)}
                              placeholder="Add a new thought..."
                              className="flex-1"
                            />
                            <Button onClick={handleAddThought} size="sm">
                              Add
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div>
                    <Card className="p-4 md:p-6">
                      {agents.length > 0 ? (
                        <div className="space-y-4">
                          {agents.map((agent) => (
                            <div 
                              key={agent.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="min-w-0 flex-1 mr-4">
                                <h3 className="font-medium truncate">{agent.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{agent.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAgent(agent);
                                  setShowCreateForm(false);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          No agents created yet. Get started by creating your first agent.
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}