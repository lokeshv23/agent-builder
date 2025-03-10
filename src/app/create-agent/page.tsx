'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Settings, Users, Plus, MessageSquare } from 'lucide-react';
import fs from 'fs/promises';
import path from 'path';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/Card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Agent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thoughts: string[];
  createdAt: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function AgentCreationPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [newThought, setNewThought] = useState('');

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

    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentName,
      description: agentDescription,
      prompt: agentPrompt,
      thoughts: [],
      createdAt: new Date().toISOString()
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

    const updatedAgent = {
      ...selectedAgent,
      thoughts: [...selectedAgent.thoughts, newThought]
    };

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAgent)
      });

      if (response.ok) {
        await loadAgents();
        setSelectedAgent(updatedAgent);
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm w-full max-w-6xl h-[calc(100vh-2rem)]">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-48 border-r flex flex-col bg-gray-50 rounded-l-lg">
            <div className="p-3 border-b bg-white rounded-tl-lg">
              <h1 className="text-lg font-semibold">Agent Builder</h1>
            </div>
            
            <nav className="flex-1 py-2">
              <div className="space-y-0.5">
                <Button
                  onClick={() => {
                    setShowCreateForm(true);
                    setSelectedAgent(null);
                  }}
                  className={`w-full justify-start text-sm h-8 px-3 font-normal ${
                    showCreateForm ? 'bg-black text-white' : ''
                  }`}
                  variant="ghost"
                >
                  Build New Agent
                </Button>
                
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="ghost"
                    className={`w-full justify-start text-sm h-8 px-3 font-normal ${
                      selectedAgent?.id === agent.id ? 'bg-black text-white' : ''
                    }`}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowCreateForm(false);
                    }}
                  >
                    {agent.name}
                  </Button>
                ))}
              </div>
            </nav>

            <div className="mt-auto border-t p-2">
              <div className="flex items-center justify-between space-x-2 text-sm">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-gray-200">
                  <Settings size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-gray-200">
                  <Users size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-gray-200">
                  <MessageSquare size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto rounded-r-lg">
            <div className="p-4">
              {showCreateForm ? (
                <div className="space-y-4 max-w-3xl">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-lg">Build Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Agent Name</label>
                        <Input 
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          placeholder="Enter agent name"
                          className="max-w-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Input
                          value={agentDescription}
                          onChange={(e) => setAgentDescription(e.target.value)}
                          placeholder="Brief description"
                          className="max-w-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Agent Prompt</label>
                        <Textarea
                          value={agentPrompt}
                          onChange={(e) => setAgentPrompt(e.target.value)}
                          placeholder="Enter the agent's initial instructions or prompt"
                          rows={4}
                          className="resize-none max-w-2xl"
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
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
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
                              {thought}
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
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                  <p>Select an agent from the sidebar or create a new one to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}