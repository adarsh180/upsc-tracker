export interface SubjectProgress {
  id: number;
  subject: string;
  category: string;
  total_lectures: number;
  completed_lectures: number;
  total_dpps: number;
  completed_dpps: number;
  revisions: number;
  updated_at: string;
  completed_lectures_list?: string;
  completed_dpps_list?: string;
}

export interface TestRecord {
  id: number;
  test_type: 'prelims' | 'mains';
  test_category: 'sectional' | 'full-length' | 'mock' | 'subjective' | 'topic-wise' | 'ncert';
  subject: string;
  total_marks: number;
  scored_marks: number;
  attempt_date: string;
  created_at: string;
}

export interface DailyGoal {
  id: number;
  date: string;
  subject: string;
  hours_studied: number;
  topics_covered: number;
  questions_solved?: number;
  notes: string;
}

export interface CurrentAffairs {
  id: number;
  total_topics: number;
  completed_topics: number;
  updated_at: string;
}

export interface EssayProgress {
  id: number;
  lectures_completed: number;
  essays_written: number;
  total_lectures: number;
  total_essays: number;
  updated_at: string;
}