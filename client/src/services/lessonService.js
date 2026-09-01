import api from './api';

export function createLesson(payload) {
  return api.post('/lessons/', payload);
}

export function getLessons(params = {}) {
  return api.get('/lessons/', { params });
}

export function getLessonsBySubject(params = {}) {
  return api.get('/lessons/subject/', { params });
}
