export type ToolName =
  | 'web_search'
  | 'calculator'
  | 'weather'
  | 'time'
  | 'translate'
  | 'summarize';

export interface Tool {
  name: ToolName;
  description: string;
  keywords: string[];
  execute: (query: string) => Promise<string>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tool?: ToolName;
}

// Tool Router - detects which tool to use based on user input
export function routeTool(input: string): ToolName | null {
  const lower = input.toLowerCase();

  if (
    lower.includes('calculate') ||
    lower.includes('what is') && /[0-9+\-*/]/.test(lower) ||
    lower.match(/\d+\s*[+\-*/]\s*\d+/)
  ) {
    return 'calculator';
  }

  if (
    lower.includes('weather') ||
    lower.includes('temperature') ||
    lower.includes('forecast') ||
    lower.includes('rain') ||
    lower.includes('sunny') ||
    lower.includes('humid')
  ) {
    return 'weather';
  }

  if (
    lower.includes('time') ||
    lower.includes('date') ||
    lower.includes('today') ||
    lower.includes('now') ||
    lower.includes('current time')
  ) {
    return 'time';
  }

  if (
    lower.includes('translate') ||
    lower.includes('in spanish') ||
    lower.includes('in french') ||
    lower.includes('in hindi') ||
    lower.includes('in arabic')
  ) {
    return 'translate';
  }

  if (
    lower.includes('summarize') ||
    lower.includes('summary') ||
    lower.includes('tldr') ||
    lower.includes('brief')
  ) {
    return 'summarize';
  }

  return null;
}

// Built-in tool executors
export async function executeTool(tool: ToolName, query: string): Promise<string> {
  switch (tool) {
    case 'calculator': {
      try {
        const expression = query.replace(/[^0-9+\-*/().\s]/g, '');
        if (!expression.trim()) return 'Could not extract a math expression.';
        const result = Function('"use strict"; return (' + expression + ')')();
        return `Calculation result: ${expression} = ${result}`;
      } catch {
        return 'Could not calculate that expression.';
      }
    }

    case 'time': {
      const now = new Date();
      return `Current date and time: ${now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'long',
      })} (IST)`;
    }

    case 'weather': {
      return `I can tell you about weather! For real-time weather data, you would need a weather API key (like OpenWeatherMap). The query was: "${query}". Please add OPENWEATHER_API_KEY to your .env.local to enable live weather.`;
    }

    case 'translate': {
      return `Translation requests are handled by the AI model directly. The AI will translate: "${query}"`;
    }

    case 'summarize': {
      return `Summarization requests are handled by the AI model. Processing: "${query}"`;
    }

    default:
      return query;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
