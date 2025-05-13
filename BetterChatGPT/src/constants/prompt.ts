interface Prompt {
  name: string;
  prompt: string;
  temperature: number;
}

export const DEFAULT_PROMPTS: Record<string, Prompt> = {
  interviewAnalyzer: {
    name: "Interview Analyzer",
    prompt: `You analyze customer interview transcripts to identify key needs, pain points, and business requirements. Extract and categorize insights in a structured format.`,
    temperature: 0.3,
  },
  workshopSummarizer: {
    name: "Workshop Summarizer",
    prompt: `You analyze discovery workshop notes to extract key customer requirements, prioritize them, and identify potential solutions that align with customer needs.`,
    temperature: 0.3,
  },
  needsSynthesizer: {
    name: "Needs Synthesizer",
    prompt: `You consolidate insights from multiple sources to create a comprehensive understanding of customer needs, identifying patterns and highlighting critical requirements.`,
    temperature: 0.4,
  },
  solutionMapper: {
    name: "Solution Mapper",
    prompt: `You match identified customer needs with appropriate solutions and services from Expleo's portfolio, providing rationale for each recommendation.`,
    temperature: 0.4,
  },
  proposalGenerator: {
    name: "Proposal Generator",
    prompt: `You create structured sales proposals based on customer needs analysis, including executive summary, solution overview, implementation approach, timeline, and pricing.`,
    temperature: 0.5,
  },
};

// Set the default prompt to the first one
export const DEFAULT_PROMPT = DEFAULT_PROMPTS.interviewAnalyzer;

export const getPromptByName = (name: string): Prompt => {
  return (DEFAULT_PROMPTS as Record<string, Prompt>)[name] || DEFAULT_PROMPT;
};

export default DEFAULT_PROMPTS;