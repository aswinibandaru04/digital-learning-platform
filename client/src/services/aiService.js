import api from './api';

export function generateQuestions(payload) {
  return api.post('/ai/generate-questions', payload);
}
