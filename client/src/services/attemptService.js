import api from './api';

export function submitAttempt(payload) {
  return api.post('/attempts/submit', payload);
}

export function getMyResults() {
  return api.get('/attempts/my-results');
}

export function getWeakTopics() {
  return api.get('/attempts/weak-topics');
}

export function getStudentAnalytics() {
  return api.get('/attempts/analytics');
}

export function getTeacherAnalytics() {
  return api.get('/attempts/teacher-analytics');
}

export function getParentAnalytics() {
  return api.get('/attempts/parent-analytics');
}
