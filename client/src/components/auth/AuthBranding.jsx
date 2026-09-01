import { GraduationCap, BookOpen, Users, Award, TrendingUp, Sparkles } from 'lucide-react';

export default function AuthBranding() {
  const benefits = [
    { icon: BookOpen, title: 'Rich Course Library', desc: 'Organize courses, subjects and lessons in one place.' },
    { icon: Sparkles, title: 'AI-Powered Questions', desc: 'Generate assignments instantly with AI assistance.' },
    { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track performance, weak topics and progress live.' },
    { icon: Award, title: 'Role-based Learning', desc: 'Tailored experiences for teachers, students and parents.' },
  ];

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 p-10 text-white lg:p-14">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight">LearnHub</p>
          <p className="text-xs text-indigo-200">Digital Learning Platform</p>
        </div>
      </div>

      <div className="relative z-10 my-10 max-w-lg">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          Empowering education through technology
        </h1>
        <p className="mt-4 text-base text-indigo-100">
          A complete learning ecosystem connecting teachers, students and parents.
          Create courses, generate AI assignments, and track real performance — all in one place.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                <b.icon className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="mt-0.5 text-xs text-indigo-100/80">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-6 text-xs text-indigo-200">
        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> 3 Role dashboards</span>
        <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Courses & Lessons</span>
        <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> Smart Analytics</span>
      </div>
    </div>
  );
}
