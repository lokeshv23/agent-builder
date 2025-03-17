import { Langfuse } from 'langfuse';

// Initialize Langfuse client
const langfuse = new Langfuse({
  publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.NEXT_PUBLIC_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_LANGFUSE_BASE_URL
});

export interface PromptConfig {
  modelName?: string;
  temperature?: number;
  schema?: Record<string, any>;
}

export interface CreatePromptParams {
  name: string;
  prompt: string;
  config?: PromptConfig;
  labels?: string[];
}

export interface UpdatePromptParams extends Partial<CreatePromptParams> {
  promptId: string;
}

class LangfuseService {
  /**
   * Create a new prompt in Langfuse
   */
  async createPrompt({
    name,
    prompt,
    config = {},
    labels = []
  }: CreatePromptParams) {
    try {
      const createdPrompt = await langfuse.createPrompt({
        name,
        prompt,
        config,
        labels
      });
      return createdPrompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  }

  /**
   * Get a prompt by its name
   */
  async getPrompt(name: string) {
    try {
      const prompt = await langfuse.getPrompt(name);
      return prompt;
    } catch (error) {
      console.error('Error fetching prompt:', error);
      throw error;
    }
  }

  /**
   * Update an existing prompt
   */
  async updatePrompt({
    promptId,
    name,
    prompt,
    config,
    labels
  }: UpdatePromptParams) {
    try {
      const updatedPrompt = await langfuse.updatePrompt(promptId, {
        name,
        prompt,
        config,
        labels
      });
      return updatedPrompt;
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }

  /**
   * Delete a prompt by its ID
   */
  async deletePrompt(id: string) {
    try {
      await langfuse.deletePrompt(id);
      return true;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  }

  /**
   * List all prompts
   */
  async listPrompts() {
    try {
      const prompts = await langfuse.prompts.list();
      return prompts;
    } catch (error) {
      console.error('Error listing prompts:', error);
      throw error;
    }
  }

  /**
   * Get a specific version of a prompt
   */
  async getPromptVersion(promptId: string, version: number) {
    try {
      const promptVersion = await langfuse.getPromptVersion(promptId, version);
      return promptVersion;
    } catch (error) {
      console.error('Error fetching prompt version:', error);
      throw error;
    }
  }

  /**
   * Create a trace for prompt usage
   */
  async createPromptTrace(promptName: string, input: any, output: any) {
    try {
      const trace = await langfuse.trace({
        name: 'Prompt Usage',
        metadata: { promptName }
      });

      await trace.generation({
        name: "Prompt Execution",
        model: "custom-prompt",
        input,
        output,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

      return trace;
    } catch (error) {
      console.error('Error creating prompt trace:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const langfuseService = new LangfuseService(); 