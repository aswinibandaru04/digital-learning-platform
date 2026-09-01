import api from './api';

// ==========================================
// TEACHER
// ==========================================

// Create assignment
export function createAssignment(payload) {
  return api.post('/assignments', payload);
}

// Get assignments created by logged-in teacher
export function getTeacherAssignments() {
  return api.get('/assignments/teacher');
}

// Get all students from database
export function getStudents() {
  return api.get('/users/students');
}

// ==========================================
// STUDENT
// ==========================================

// Get assignments assigned to logged-in student
export function getStudentAssignments() {
  return api.get('/assignments/student');
}

// Get a single assignment
export function getAssignment(id) {
  return api.get(`/assignments/${id}`);
}

// ==========================================
// AI
// ==========================================

// Generate AI assignment questions
export function generateAIAssignment(payload) {
  return api.post('/assignments/generate-ai', payload);
}