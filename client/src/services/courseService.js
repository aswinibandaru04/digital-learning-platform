import api from './api';

export function createCourse(payload) {
  return api.post('/courses/', payload);
}

export function getCourses() {
  return api.get('/courses/');
}
