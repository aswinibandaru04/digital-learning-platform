import api from './api';

export function createSubject(payload) {
  return api.post('/subjects/', payload);
}

export function getSubjects(params = {}) {
  return api.get('/subjects/', { params });
}

export function getSubjectsByCourse(params = {}) {
  return api.get('/subjects/course/', { params });
}
