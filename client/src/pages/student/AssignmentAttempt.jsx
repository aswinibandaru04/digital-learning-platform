import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Award } from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';
import Badge from '@/components/common/Badge';
import { useToast } from '@/components/common/Toast';

import { getAssignment } from '@/services/assignmentService';
import { submitAttempt } from '@/services/attemptService';
import { extractError } from '@/services/api';

export default function AssignmentAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Stores which questions have already been checked
  const [checkedAnswers, setCheckedAnswers] = useState({});

  // Stores feedback for the current question
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await getAssignment(id);

        const a = data.assignment || data;

        setAssignment(a);
      } catch (err) {
        setError(
          extractError(err, 'Could not load this assignment.')
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const questions = assignment?.questions || [];

  // ============================================
  // SELECT ANSWER
  // ============================================

  const selectAnswer = (qId, option) => {
    // Do not allow changing answer after checking
    if (checkedAnswers[qId]) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));

    // Clear old feedback if user selects a new answer
    setFeedback(null);
  };

  // ============================================
  // CHECK ANSWER
  // ============================================

  const checkAnswer = () => {
    const q = questions[currentQuestionIndex];

    if (!q) {
      return;
    }

    const qId = q._id || q.id;
    const selected = answers[qId];

    if (!selected) {
      toast.error('Please select an answer first.');
      return;
    }

    // Prevent checking again
    if (checkedAnswers[qId]) {
      return;
    }
    
    console.log("QUESTION:", q);
    console.log("EXPLANATION:", q.explanation);
    const correctAnswer = q.correctAnswer;

    const isCorrect =
      String(selected).trim().toLowerCase() ===
      String(correctAnswer).trim().toLowerCase();

    // Mark this question as checked
    setCheckedAnswers((prev) => ({
      ...prev,
      [qId]: true,
    }));

    // Show feedback
    setFeedback({
      isCorrect,
      correctAnswer,
      explanation: q.explanation || '',
    });
  };

  // ============================================
  // NEXT QUESTION
  // ============================================

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);

      // Clear feedback for new question
      setFeedback(null);
    }
  };

  // ============================================
  // CHECK IF ALL QUESTIONS ARE ANSWERED
  // ============================================

  const allAnswered =
    questions.length > 0 &&
    questions.every((q) => {
      const qId = q._id || q.id;
      return answers[qId];
    });

  // ============================================
  // SUBMIT ASSIGNMENT
  // ============================================

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error(
        'Please answer all questions before submitting.'
      );
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        assignmentId: assignment._id || assignment.id,

        answers: questions.map((q) => {
          const qId = q._id || q.id;

          return {
            questionId: qId,
            selectedAnswer: answers[qId],
          };
        }),
      };

      const { data } = await submitAttempt(payload);

      setResult(data);

      toast.success(
        'Assignment submitted successfully!'
      );
    } catch (err) {
      setError(
        extractError(
          err,
          'Failed to submit assignment.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <Loader
        size="lg"
        label="Loading assignment..."
      />
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // ============================================
  // ASSIGNMENT NOT FOUND
  // ============================================

  if (!assignment) {
    return (
      <ErrorMessage message="Assignment not found." />
    );
  }

  // ============================================
  // RESULT PAGE
  // ============================================

  if (result) {
    const pct =
      result.percentage ??
      (result.score && result.totalQuestions
        ? (result.score / result.totalQuestions) * 100
        : 0);

    return (
      <div>
        <PageHeader
          title="Results"
          description={assignment.title}
        />

        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              pct >= 50
                ? 'bg-emerald-100'
                : 'bg-rose-100'
            }`}
          >
            <Award
              className={`h-8 w-8 ${
                pct >= 50
                  ? 'text-emerald-600'
                  : 'text-rose-500'
              }`}
            />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {Number(pct).toFixed(1)}%
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Scored {result.score} out of{' '}
            {result.totalQuestions} questions
          </p>

          <SuccessMessage
            message="Assignment submitted successfully!"
            className="mt-4"
          />

          <div className="mt-6 flex justify-center gap-3">
            <Link to="/student/results">
              <Button>
                View All Results
              </Button>
            </Link>

            <Button
              variant="secondary"
              onClick={() =>
                navigate('/student/assignments')
              }
            >
              Back to Assignments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN ASSIGNMENT PAGE
  // ============================================

  return (
    <div>
      <Link
        to="/student/assignments"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />

        Back to assignments
      </Link>

      <PageHeader
        title={assignment.title}
        description={
          assignment.description ||
          `Topic: ${assignment.topic || '—'}`
        }
        action={
          assignment.dueDate && (
            <Badge color="amber">
              <Clock className="mr-1 inline h-3 w-3" />

              Due{' '}
              {new Date(
                assignment.dueDate
              ).toLocaleDateString()}
            </Badge>
          )
        }
      />

      {error && (
        <ErrorMessage
          message={error}
          className="mb-5"
        />
      )}

      {/* ============================================
          QUESTION
          ============================================ */}

      <div className="space-y-4">
        {questions.length > 0 &&
          (() => {
            const q =
              questions[currentQuestionIndex];

            const qId = q._id || q.id;

            const selected = answers[qId];

            const isChecked =
              checkedAnswers[qId] === true;

            return (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                {/* QUESTION HEADER */}

                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    <span className="text-slate-400">
                      Question{' '}
                      {currentQuestionIndex + 1}
                    </span>
                  </p>

                  <span className="text-xs text-slate-500">
                    {currentQuestionIndex + 1} of{' '}
                    {questions.length}
                  </span>
                </div>

                {/* QUESTION TEXT */}

                <p className="text-base font-semibold text-slate-900">
                  {q.questionText}
                </p>

                {/* OPTIONS */}

                <div className="mt-4 space-y-2">
                  {(q.options || []).map(
                    (opt, oIdx) => {
                      const isSelected =
                        selected === opt;

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() =>
                            selectAnswer(
                              qId,
                              opt
                            )
                          }
                          disabled={isChecked}
                          className={`flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          } ${
                            isChecked
                              ? 'cursor-not-allowed opacity-90'
                              : ''
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-500'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </span>

                          {opt}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* ====================================
                    FEEDBACK
                    ==================================== */}

                {feedback && (
                  <div
                    className={`mt-5 rounded-lg border p-4 ${
                      feedback.isCorrect
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <p
                      className={`font-semibold ${
                        feedback.isCorrect
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {feedback.isCorrect
                        ? '✓ Correct! 🎉'
                        : '✗ Wrong Answer'}
                    </p>

                    

                    {/* EXPLANATION */}

                    {feedback.explanation && (
                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <p className="text-sm font-semibold text-slate-700">
                          Explanation
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {feedback.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ====================================
                    CHECK / NEXT / SUBMIT
                    ==================================== */}

                <div className="mt-5 flex justify-end">
                  {!isChecked ? (
                    <Button
                      type="button"
                      onClick={checkAnswer}
                      disabled={!selected}
                    >
                      Check Answer
                    </Button>
                  ) : currentQuestionIndex <
                    questions.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextQuestion}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      loading={submitting}
                      disabled={submitting}
                    >
                      Submit Assignment
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
      </div>

      {/* QUESTION COUNTER */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Question {currentQuestionIndex + 1} of{' '}
          {questions.length}
        </p>
      </div>
    </div>
  );
}