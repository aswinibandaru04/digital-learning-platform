import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/common/Toast';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile';

import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import TeacherCourses from '@/pages/teacher/Courses';
import TeacherSubjects from '@/pages/teacher/Subjects';
import TeacherLessons from '@/pages/teacher/Lessons';
import TeacherAssignments from '@/pages/teacher/Assignments';
import AIGenerator from '@/pages/teacher/AIGenerator';
import TeacherAnalytics from '@/pages/teacher/Analytics';

import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentCourses from '@/pages/student/Courses';
import StudentSubjects from '@/pages/student/Subjects';
import StudentLessons from '@/pages/student/Lessons';
import StudentAssignments from '@/pages/student/Assignments';
import AssignmentAttempt from '@/pages/student/AssignmentAttempt';
import Results from '@/pages/student/Results';
import WeakTopics from '@/pages/student/WeakTopics';
import StudentAnalytics from '@/pages/student/Analytics';

import ParentDashboard from '@/pages/parent/ParentDashboard';
import LinkStudent from '@/pages/parent/LinkStudent';
import ParentAnalytics from '@/pages/parent/Analytics';

const roleHome = {
  Teacher: '/teacher/dashboard',
  Student: '/student/dashboard',
  Parent: '/parent/dashboard',
};

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && roleHome[user.role]) return <Navigate to={roleHome[user.role]} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Teacher */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['Teacher']}>
                    <DashboardLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherCourses />} />
              <Route path="subjects" element={<TeacherSubjects />} />
              <Route path="lessons" element={<TeacherLessons />} />
              <Route path="assignments" element={<TeacherAssignments />} />
              <Route path="ai-generator" element={<AIGenerator />} />
              <Route path="analytics" element={<TeacherAnalytics />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Student */}
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['Student']}>
                    <DashboardLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="subjects" element={<StudentSubjects />} />
              <Route path="lessons" element={<StudentLessons />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="assignments/:id" element={<AssignmentAttempt />} />
              <Route path="results" element={<Results />} />
              <Route path="weak-topics" element={<WeakTopics />} />
              <Route path="analytics" element={<StudentAnalytics />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Parent */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['Parent']}>
                    <DashboardLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/parent/dashboard" replace />} />
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="link-student" element={<LinkStudent />} />
              <Route path="analytics" element={<ParentAnalytics />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}