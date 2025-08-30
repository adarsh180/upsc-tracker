// Input validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password) && password.length <= 128;
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export function validateNumericInput(value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number | null {
  const num = parseInt(value);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

export function validateDateInput(dateString: string): Date | null {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Check if date is within reasonable range (1900 to 2100)
  const year = date.getFullYear();
  if (year < 1900 || year > 2100) {
    return null;
  }
  
  return date;
}

// SQL injection prevention - whitelist approach
export const ALLOWED_FIELDS = {
  subject_progress: [
    'total_lectures', 
    'completed_lectures', 
    'total_dpps', 
    'completed_dpps', 
    'revisions',
    'questions_count'
  ],
  daily_goals: [
    'subject',
    'hours_studied',
    'topics_covered',
    'questions_solved',
    'notes'
  ],
  test_records: [
    'test_type',
    'test_category',
    'subject',
    'total_marks',
    'scored_marks',
    'attempt_date'
  ]
};

export function validateFieldName(table: string, field: string): boolean {
  const allowedFields = ALLOWED_FIELDS[table as keyof typeof ALLOWED_FIELDS];
  return allowedFields ? allowedFields.includes(field) : false;
}