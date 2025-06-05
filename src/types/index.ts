export interface TestConfiguration {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  tests: TestType[];
  status: 'draft' | 'active' | 'completed';
  aiSystemPrompt?: string;
}

export type TestType = 'neo' | 'pes' | 'pcl';

export interface TestQuestion {
  id: string;
  testType: TestType;
  question: string;
  category: string;
  subCategory?: string;
  prompt: string;
}

export interface TestResult {
  id: string;
  configurationId: string;
  testType: TestType;
  createdAt: Date;
  scores: {
    [key: string]: number | {
      [subKey: string]: number;
    };
  };
  rawResponses: {
    [questionId: string]: string;
  };
  summary: string;
}

export type ChartData = {
  name: string;
  value: number;
  fullMark: number;
}[];