import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Plus,
  Users,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';

import { useToast } from '@/components/common/Toast';

import {
  getTeacherAssignments,
  createAssignment,
  getStudents,
  generateAIAssignment,
} from '@/services/assignmentService';

import { extractError } from '@/services/api';

const DIFFICULTY = ['Easy', 'Medium', 'Hard'];

function emptyQuestion() {
  return {
    questionText: '',
    questionType: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 'Easy',
  };
}
export default function TeacherAssignments() {
  const toast = useToast();

  // --------------------------------------------------
  // Assignment list state
  // --------------------------------------------------

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --------------------------------------------------
  // Assignment modal state
  // --------------------------------------------------

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------
  // Student selection state
  // --------------------------------------------------

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  // --------------------------------------------------
  // Assignment form
  // --------------------------------------------------

  const [form, setForm] = useState({
    title: '',
    topic: '',
    description: '',
    dueDate: '',
    questions: [emptyQuestion()],
    assignedTo: [],
  });

  const [formErrors, setFormErrors] = useState({});

  // --------------------------------------------------
// AI Question Generator state
// --------------------------------------------------

const [aiForm, setAiForm] = useState({
  topic: '',
  difficulty: 'Easy',
  numberOfQuestions: 5,
  questionType: 'multiple-choice',
});

const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState('');

  // --------------------------------------------------
  // Load teacher assignments
  // --------------------------------------------------

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await getTeacherAssignments();

      setAssignments(data.assignments || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  const validate = () => {
    const e = {};

    if (!form.title.trim()) {
      e.title = 'Title is required';
    }

    if (!form.topic.trim()) {
      e.topic = 'Topic is required';
    }

    if (!form.dueDate) {
      e.dueDate = 'Due date is required';
    }

    // At least one student is required
    if (form.assignedTo.length === 0) {
      e.assignedTo = 'Select at least one student';
    }

    // Validate questions
    // Validate questions
const qErrs = form.questions.map((q) => {
  const qe = {};

  if (!q.questionText.trim()) {
    qe.questionText = 'Required';
  }

  // Multiple Choice validation
  if (q.questionType === 'multiple-choice') {
    if (
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      q.options.some((o) => !o.trim())
    ) {
      qe.options = 'All 4 options required';
    }

    if (!q.correctAnswer.trim()) {
      qe.correctAnswer = 'Required';
    } else if (!q.options.includes(q.correctAnswer)) {
      qe.correctAnswer = 'Must match one option';
    }
  }

  // True / False validation
  else if (q.questionType === 'true-false') {
    if (!q.correctAnswer.trim()) {
      qe.correctAnswer = 'Required';
    } else if (
      q.correctAnswer !== 'True' &&
      q.correctAnswer !== 'False'
    ) {
      qe.correctAnswer =
        'Answer must be True or False';
    }
  }

  // Fill in the Blank and Short Answer
  else {
    if (!q.correctAnswer.trim()) {
      qe.correctAnswer = 'Required';
    }
  }

  return qe;
});

    const hasQErrors = qErrs.some(
      (q) => Object.keys(q).length > 0
    );

    if (hasQErrors) {
      e.questions = qErrs;
    }

    setFormErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleGenerateAIQuestions = async () => {
  setAiError('');

  if (!aiForm.topic.trim()) {
    setAiError('Please enter a topic');
    return;
  }

  if (
    !aiForm.numberOfQuestions ||
    aiForm.numberOfQuestions < 1 ||
    aiForm.numberOfQuestions > 20
  ) {
    setAiError('Number of questions must be between 1 and 20');
    return;
  }

  setAiLoading(true);

  try {
   const { data } = await generateAIAssignment({
  topic: aiForm.topic.trim(),
  difficulty: aiForm.difficulty,
  numberOfQuestions: Number(aiForm.numberOfQuestions),
  questionType: aiForm.questionType,
});

    const generatedQuestions =
      data.questions ||
      data.generatedQuestions ||
      data.data?.questions ||
      [];

    if (generatedQuestions.length === 0) {
      setAiError('No questions were generated. Try a different topic.');
      return;
    }

    setForm((previous) => ({
      ...previous,
      topic: aiForm.topic.trim(),
   questions: generatedQuestions.map((question) => {
  const questionType =
    question.questionType ||
    question.question_type ||
    aiForm.questionType;

  return {
    questionText:
      question.questionText ||
      question.question ||
      question.text ||
      '',

    questionType,

    options:
      Array.isArray(question.options)
        ? question.options
        : questionType === 'multiple-choice'
        ? ['', '', '', '']
        : questionType === 'true-false'
        ? ['True', 'False']
        : [],

    correctAnswer:
      question.correctAnswer ||
      question.correct_answer ||
      question.answer ||
      '',

    explanation:
      question.explanation ||
      '',

    difficulty:
      question.difficulty || aiForm.difficulty,
};
}),
    }));

    toast.success(
      `${generatedQuestions.length} questions generated successfully`
    );
  } catch (err) {
    setAiError(
      extractError(
        err,
        'Failed to generate questions. Make sure the AI service is running.'
      )
    );
  } finally {
    setAiLoading(false);
  }
};

  // --------------------------------------------------
  // Create assignment
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await createAssignment({
        title: form.title.trim(),
        topic: form.topic.trim(),
        description: form.description.trim(),
        questions: form.questions,
        assignedTo: form.assignedTo,
        dueDate: form.dueDate,
      });

      toast.success('Assignment created successfully');

      setModalOpen(false);

      setForm({
        title: '',
        topic: '',
        description: '',
        dueDate: '',
        questions: [emptyQuestion()],
        assignedTo: [],
      });

      setFormErrors({});

      load();
    } catch (err) {
      toast.error(
        extractError(err, 'Failed to create assignment')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Question functions
  // --------------------------------------------------

  const updateQuestion = (idx, field, value) => {
    const qs = [...form.questions];

    qs[idx] = {
      ...qs[idx],
      [field]: value,
    };

    setForm({
      ...form,
      questions: qs,
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    const qs = [...form.questions];

    qs[qIdx].options = qs[qIdx].options.map(
      (o, i) => (i === oIdx ? value : o)
    );

    setForm({
      ...form,
      questions: qs,
    });
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        emptyQuestion(),
      ],
    });
  };

  const removeQuestion = (idx) => {
    setForm({
      ...form,
      questions: form.questions.filter(
        (_, i) => i !== idx
      ),
    });
  };

  // --------------------------------------------------
  // Open student selector
  // --------------------------------------------------

  const openStudentSelector = async () => {
    setStudentModalOpen(true);
    setStudentsLoading(true);
    setStudentsError('');

    try {
      const { data } = await getStudents();

      setStudents(data.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);

      setStudentsError(
        extractError(
          err,
          'Failed to load students from database'
        )
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  // --------------------------------------------------
  // Select / unselect student
  // --------------------------------------------------

  const toggleStudent = (studentId) => {
    setForm((previous) => {
      const alreadySelected =
        previous.assignedTo.includes(studentId);

      return {
        ...previous,
        assignedTo: alreadySelected
          ? previous.assignedTo.filter(
              (id) => id !== studentId
            )
          : [
              ...previous.assignedTo,
              studentId,
            ],
      };
    });
  };

  // --------------------------------------------------
  // Remove selected student
  // --------------------------------------------------

  const removeStudent = (studentId) => {
    setForm((previous) => ({
      ...previous,
      assignedTo: previous.assignedTo.filter(
        (id) => id !== studentId
      ),
    }));
  };

  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const statusColor = {
    Draft: 'slate',
    Published: 'emerald',
    Completed: 'indigo',
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div>
      {/* ================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        title="Assignments"
        description="Create and track your assignments"
        action={
          <div className="flex gap-2">
            <Link to="/teacher/ai-generator">
              <Button variant="outline">
                AI Generator
              </Button>
            </Link>

            <Button
              onClick={() => {
                setModalOpen(true);
                setFormErrors({});
              }}
            >
              <Plus className="h-4 w-4" />
              New Assignment
            </Button>
          </div>
        }
      />

      {/* ================================================
          ERROR
      ================================================= */}

      {error && (
        <ErrorMessage
          message={error}
          className="mb-6"
        />
      )}

      {/* ================================================
          ASSIGNMENT LIST
      ================================================= */}

      {loading ? (
        <Loader label="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments available yet"
          description="Create assignments or use the AI Question Generator to get started."
          action={
            <Button
              onClick={() => {
                setModalOpen(true);
                setFormErrors({});
              }}
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Title
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Topic
                </th>

                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Assigned
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Due
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <tr
                  key={a._id || a.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-900">
                      {a.title}
                    </p>

                    <p className="text-xs text-slate-400">
                      {a.questions?.length || 0} questions
                    </p>
                  </td>

                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {a.topic || '—'}
                  </td>

                  <td className="hidden px-5 py-3.5 text-sm text-slate-600 md:table-cell">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {a.assignedTo?.length || 0}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {formatDate(a.dueDate)}
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge
                      color={
                        statusColor[a.status] ||
                        'slate'
                      }
                    >
                      {a.status || 'Draft'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================================================
          CREATE ASSIGNMENT MODAL
      ================================================= */}

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false);
          }
        }}
        title="Create Assignment"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              Create Assignment
            </Button>
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* ============================================
              BASIC ASSIGNMENT DETAILS
          ============================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              error={formErrors.title}
              placeholder="Assignment title"
              required
            />

            <Input
              label="Topic"
              name="topic"
              value={form.topic}
              onChange={(e) =>
                setForm({
                  ...form,
                  topic: e.target.value,
                })
              }
              error={formErrors.topic}
              placeholder="e.g. Fractions"
              required
            />

            <Input
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="Brief description"
            />

            <Input
              label="Due date"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  dueDate: e.target.value,
                })
              }
              error={formErrors.dueDate}
              required
            />
          </div>

          {/* ============================================
    AI QUESTION GENERATOR
============================================= */}

<div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
  <div className="mb-4">
    <div className="flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-indigo-600" />

      <h3 className="text-sm font-semibold text-slate-800">
        AI Question Generator
      </h3>
    </div>

    <p className="mt-1 text-xs text-slate-500">
      Generate questions automatically and review or edit them before
      creating the assignment.
    </p>
  </div>

<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Input
      label="Topic"
      value={aiForm.topic}
      onChange={(e) => {
        setAiForm({
          ...aiForm,
          topic: e.target.value,
        });
        setAiError('');
      }}
      placeholder="e.g. Fractions"
      required
    />

    <Select
      label="Difficulty"
      value={aiForm.difficulty}
      onChange={(e) => {
        setAiForm({
          ...aiForm,
          difficulty: e.target.value,
        });
        setAiError('');
      }}
      options={DIFFICULTY.map((d) => ({
        value: d,
        label: d,
      }))}
    />

    <Input
      label="Number of questions"
      type="number"
      min={1}
      max={20}
      value={aiForm.numberOfQuestions}
      onChange={(e) => {
        setAiForm({
          ...aiForm,
          numberOfQuestions: e.target.value,
        });
        setAiError('');
      }}
      placeholder="1 - 20"
    />

    <Select
  label="Question Type"
  value={aiForm.questionType}
  onChange={(e) => {
    setAiForm({
      ...aiForm,
      questionType: e.target.value,
    });

    setAiError('');
  }}
  options={[
    {
      value: 'multiple-choice',
      label: 'Multiple Choice',
    },
    {
      value: 'true-false',
      label: 'True / False',
    },
    {
      value: 'fill-in-the-blank',
      label: 'Fill in the Blanks',
    },
    {
      value: 'short-answer',
      label: 'Short Answer',
    },
    {
      value: 'mixed',
      label: 'Mixed Question Types',
    },
  ]}
/>

  </div>

  {aiError && (
    <ErrorMessage
      message={aiError}
      className="mt-3"
    />
  )}

  <div className="mt-4">
    <Button
      type="button"
      onClick={handleGenerateAIQuestions}
      loading={aiLoading}
      disabled={aiLoading}
      variant="outline"
    >
      <Sparkles className="h-4 w-4" />

      {aiLoading
        ? 'Generating Questions...'
        : 'Generate Questions with AI'}
    </Button>
  </div>
</div>

          {/* ============================================
              STUDENT SELECTION
          ============================================= */}

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Assign to students
              </label>

              <Button
                type="button"
                variant="secondary"
                onClick={openStudentSelector}
              >
                <Users className="h-4 w-4" />
                Add Student
              </Button>
            </div>

            {formErrors.assignedTo && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.assignedTo}
              </p>
            )}

            {/* Selected students */}

            {form.assignedTo.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-center">
                <Users className="mx-auto mb-2 h-6 w-6 text-slate-400" />

                <p className="text-sm text-slate-500">
                  No students selected
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Click "Add Student" to select students
                  from your database.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {form.assignedTo.map(
                  (studentId) => {
                    const student =
                      students.find(
                        (s) =>
                          s._id === studentId
                      );

                    return (
                      <div
                        key={studentId}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                            {student?.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              'S'}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {student?.name ||
                                'Selected student'}
                            </p>

                            <p className="text-xs text-slate-500">
                              {student?.email || ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeStudent(
                              studentId
                            )
                          }
                          className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                          title="Remove student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* ============================================
              QUESTIONS
          ============================================= */}

          <div className="border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Questions
              </p>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addQuestion}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {form.questions.map(
                (q, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Question {idx + 1}
                      </span>

                      {form.questions.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(
                              idx
                            )
                          }
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Input
                        label="Question text"
                        value={
                          q.questionText
                        }
                        onChange={(e) =>
                          updateQuestion(
                            idx,
                            'questionText',
                            e.target.value
                          )
                        }
                        error={
                          formErrors.questions?.[
                            idx
                          ]?.questionText
                        }
                        placeholder="Enter the question"
                      />

                      {/* MULTIPLE CHOICE OPTIONS */}

{q.questionType === 'multiple-choice' && (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {q.options.map((opt, oIdx) => (
      <Input
        key={oIdx}
        label={`Option ${oIdx + 1}`}
        value={opt}
        onChange={(e) =>
          updateOption(
            idx,
            oIdx,
            e.target.value
          )
        }
        placeholder={`Option ${oIdx + 1}`}
      />
    ))}
  </div>
)}

{/* TRUE / FALSE OPTIONS */}

{q.questionType === 'true-false' && (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {q.options.map((opt, oIdx) => (
      <Input
        key={oIdx}
        label={`Option ${oIdx + 1}`}
        value={opt}
        onChange={(e) =>
          updateOption(
            idx,
            oIdx,
            e.target.value
          )
        }
      />
    ))}
  </div>
)}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
  label={
    q.questionType === 'short-answer'
      ? 'Model Answer'
      : 'Correct Answer'
  }
  value={q.correctAnswer}
  onChange={(e) =>
    updateQuestion(
      idx,
      'correctAnswer',
      e.target.value
    )
  }
  error={
    formErrors.questions?.[
      idx
    ]?.correctAnswer
  }
  placeholder={
    q.questionType === 'multiple-choice'
      ? 'Must match one option exactly'
      : q.questionType === 'true-false'
      ? 'True or False'
      : q.questionType === 'fill-in-the-blank'
      ? 'Enter the missing answer'
      : 'Enter the expected answer'
  }
/>

                        <Select
                          label="Difficulty"
                          value={q.difficulty}
                          onChange={(e) =>
                            updateQuestion(
                              idx,
                              'difficulty',
                              e.target.value
                            )
                          }
                          options={DIFFICULTY.map(
                            (d) => ({
                              value: d,
                              label: d,
                            })
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* ================================================
          STUDENT SELECTION MODAL
      ================================================= */}

      <Modal
        open={studentModalOpen}
        onClose={() =>
          setStudentModalOpen(false)
        }
        title="Select Students"
        size="md"
        footer={
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {form.assignedTo.length}{' '}
              student
              {form.assignedTo.length !== 1
                ? 's'
                : ''}{' '}
              selected
            </p>

            <Button
              variant="secondary"
              onClick={() =>
                setStudentModalOpen(false)
              }
            >
              Done
            </Button>
          </div>
        }
      >
        {studentsLoading ? (
          <Loader label="Loading students..." />
        ) : studentsError ? (
          <ErrorMessage
            message={studentsError}
          />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description="There are no registered students in the database."
          />
        ) : (
          <div className="space-y-2">
            {students.map((student) => {
              const selected =
                form.assignedTo.includes(
                  student._id
                );

              return (
                <label
                  key={student._id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    selected
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleStudent(
                        student._id
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {student.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      'S'}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {student.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {student.email}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}