import { useEffect, useState } from 'react';
import { BookOpen, Layers, FileText, ClipboardList, Users, TrendingUp, Percent } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getCourses } from '@/services/courseService';
import { getSubjects } from '@/services/subjectService';
import { getLessons } from '@/services/lessonService';
import { getTeacherAssignments } from '@/services/assignmentService';
import { getTeacherAnalytics } from '@/services/attemptService';
import { extractError } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [courses, subjects, lessons, assignments, analytics] = await Promise.allSettled([
          getCourses(),
          getSubjects(),
          getLessons(),
          getTeacherAssignments(),
          getTeacherAnalytics(),
        ]);
        if (!active) return;
        const val = (r) => (r.status === 'fulfilled' ? r.value.data : null);
        const a = val(analytics);
        setStats({
          courses: val(courses)?.count ?? val(courses)?.courses?.length ?? 0,
          subjects: val(subjects)?.count ?? val(subjects)?.subjects?.length ?? 0,
          lessons: val(lessons)?.count ?? val(lessons)?.lessons?.length ?? 0,
          assignments: val(assignments)?.count ?? val(assignments)?.assignments?.length ?? 0,
          totalStudents: a?.totalStudents ?? 0,
          averageClassScore: a?.averageClassScore ?? 0,
          completionRate: a?.completionRate ?? 0,
        });
      } catch (err) {
        if (active) setError(extractError(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div>
      <PageHeader title="Teacher Dashboard" description={`Overview of your teaching activity${user?.name ? ', ' + user.name : ''}`} />

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <Loader size="lg" label="Loading dashboard..." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard icon={BookOpen} label="Total Courses" value={stats?.courses ?? 0} accent="indigo" />
          <StatCard icon={Layers} label="Total Subjects" value={stats?.subjects ?? 0} accent="blue" />
          <StatCard icon={FileText} label="Total Lessons" value={stats?.lessons ?? 0} accent="violet" />
          <StatCard icon={ClipboardList} label="Total Assignments" value={stats?.assignments ?? 0} accent="amber" />
          <StatCard icon={Users} label="Total Students" value={stats?.totalStudents ?? 0} accent="sky" />
          <StatCard icon={TrendingUp} label="Average Class Score" value={`${Number(stats?.averageClassScore ?? 0).toFixed(1)}%`} accent="emerald" />
          <StatCard icon={Percent} label="Completion Rate" value={`${Number(stats?.completionRate ?? 0).toFixed(1)}%`} accent="rose" />
        </div>
      )}
    </div>
  );
}
