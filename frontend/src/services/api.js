import axios from 'axios';
import { MOCK_SUBJECTS, MOCK_EXAMS, MOCK_EXAM_DETAILS } from '../mock/sampleExams';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const requestPath = config.url || '';
  const isKnowledgeRequest = requestPath.startsWith('/knowledge');
  const isUserRequest = requestPath.startsWith('/users/me') || /\/exams\/[^/]+\/submit$/.test(requestPath);
  const token = isKnowledgeRequest
    ? sessionStorage.getItem('moon_admin_token')
    : isUserRequest
      ? sessionStorage.getItem('moon_user_token')
      : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  // Subjects
  getSubjects: async () => {
    try {
      const res = await client.get('/subjects');
      return res.data;
    } catch (err) {
      if (!import.meta.env.DEV) throw err;
      console.warn('API error, using mock subjects:', err);
      return MOCK_SUBJECTS;
    }
  },

  // Exams
  getExams: async (subjectCode = '', filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (subjectCode) params.set('subject_code', subjectCode);
      if (filters.query?.trim()) params.set('q', filters.query.trim());
      if (filters.topic) params.set('topic', filters.topic);
      if (filters.lesson) params.set('lesson', filters.lesson);
      if (filters.grade) params.set('grade', filters.grade);
      const res = await client.get(`/exams${params.size ? `?${params.toString()}` : ''}`);
      return res.data;
    } catch (err) {
      if (!import.meta.env.DEV) throw err;
      console.warn('API error, using mock exams:', err);
      const term = filters.query?.trim().toLowerCase() || '';
      const candidates = MOCK_EXAMS.filter((exam) => (!subjectCode || exam.subject_code === subjectCode)
        && (!term || `${exam.title} ${exam.description}`.toLowerCase().includes(term)));
      const details = await Promise.all(candidates.map((exam) => api.getExamDetail(exam.id)));
      return candidates.filter((exam, index) => {
        const questions = details[index].questions || [];
        return (!filters.topic || questions.some((question) => question.topic === filters.topic || question.chapter === filters.topic))
          && (!filters.lesson || questions.some((question) => question.lesson === filters.lesson))
          && (!filters.grade || questions.some((question) => String(question.grade || 12) === String(filters.grade)));
      });
    }
  },

  getExamFilters: async (subjectCode = '', topic = '') => {
    try {
      const params = new URLSearchParams();
      if (subjectCode) params.set('subject_code', subjectCode);
      if (topic) params.set('topic', topic);
      const res = await client.get(`/exams/filters${params.size ? `?${params.toString()}` : ''}`);
      return res.data;
    } catch {
      if (!import.meta.env.DEV) throw new Error('Không thể tải bộ lọc đề luyện tập.');
      return api.getQuestionFilters(subjectCode, topic);
    }
  },

  getExamDetail: async (examId) => {
    try {
      const res = await client.get(`/exams/${examId}`);
      return res.data;
    } catch (err) {
      if (!import.meta.env.DEV) throw err;
      console.warn('API error, using mock exam detail:', err);
      const exam = MOCK_EXAM_DETAILS[examId] || MOCK_EXAM_DETAILS['exam-toan-01'];
      const correctMap = { 1001: 'C', 1002: 'B', 1003: 'B', 1004: 'A', 1005: 'C', 1006: 'B' };
      return {
        ...exam,
        questions: exam.questions.map((question) => ({
          ...question,
          correct_option: correctMap[question.id] || 'A',
          raw_explanation: question.raw_explanation || `Đáp án đúng là ${correctMap[question.id] || 'A'}. Bạn có thể mở chat AI để xem giải thích chi tiết.`,
        })),
      };
    }
  },

  submitExam: async (examId, data) => {
    try {
      const res = await client.post(`/exams/${examId}/submit`, data);
      return res.data;
    } catch (err) {
      if (!import.meta.env.DEV) throw err;
      console.warn('API error, simulating submit result:', err);
      // Simulate submission scoring
      const exam = MOCK_EXAM_DETAILS[examId] || MOCK_EXAM_DETAILS['exam-toan-01'];
      let correct = 0;
      const reviews = exam.questions.map((q) => {
        const studentAns = data.selected_answers[String(q.order)] || data.selected_answers[String(q.id)] || null;
        // Mock correct options
        const correctMap = { 1001: 'C', 1002: 'B', 1003: 'B', 1004: 'A', 1005: 'C', 1006: 'B' };
        const correctAns = correctMap[q.id] || 'A';
        const isCorrect = studentAns === correctAns;
        if (isCorrect) correct += 1;
        return {
          question_id: q.id,
          order: q.order,
          content: q.content,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          student_answer: studentAns,
          correct_answer: correctAns,
          is_correct: isCorrect,
          raw_explanation: `Giải thích chuẩn: Đáp án ${correctAns} là phương án chính xác.`
        };
      });

      return {
        submission_id: 'sub-' + Date.now(),
        exam_id: examId,
        user_name: data.user_name || 'Thí sinh tự do',
        score: Math.round((correct / exam.questions.length) * 10 * 10) / 10,
        total_correct: correct,
        total_questions: exam.questions.length,
        completed_seconds: data.completed_seconds || 120,
        submitted_at: new Date().toISOString(),
        questions_review: reviews
      };
    }
  },

  // Questions
  searchQuestions: async (query = '', filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (filters.subjectCode) params.set('subject_code', filters.subjectCode);
      if (filters.topic) params.set('topic', filters.topic);
      if (filters.lesson) params.set('lesson', filters.lesson);
      if (filters.grade) params.set('grade', filters.grade);
      params.set('limit', '100');
      const res = await client.get(`/questions/search?${params.toString()}`);
      return res.data;
    } catch (err) {
      if (!import.meta.env.DEV) throw err;
      console.warn('API error, using mock question search:', err);
      return [
        {
          id: 1001,
          subject_code: 'toan',
          topic: 'Khảo sát hàm số',
          lesson: 'Cực trị của hàm số',
          grade: 12,
          content: "Cho hàm số $y = f(x)$ có bảng xét dấu đạo hàm: $f'(x) > 0$ trên $(-\\infty; 1)$...",
          option_a: "Hàm số nghịch biến trên khoảng $(-\\infty; 1)$.",
          option_b: "Hàm số đồng biến trên khoảng $(1; 3)$.",
          option_c: "Hàm số đạt cực đại tại điểm $x = 1$.",
          option_d: "Hàm số đạt cực tiểu tại điểm $x = 1$.",
          correct_option: "C",
          difficulty: 2,
          chapter: "Cực trị của hàm số",
          raw_explanation: "Theo định lý cực trị, $f'(x)$ đổi dấu từ dương sang âm tại $x = 1$ nên đây là điểm cực đại."
        }
      ].filter((item) => {
        const term = query.trim().toLowerCase();
        const queryMatch = !term || (term.match(/^\d+$/)
          ? String(item.id) === term
          : `${item.content} ${item.chapter} ${item.tags || ''}`.toLowerCase().includes(term));
        return queryMatch
          && (!filters.subjectCode || item.subject_code === filters.subjectCode)
          && (!filters.topic || item.topic === filters.topic)
          && (!filters.lesson || item.lesson === filters.lesson)
          && (!filters.grade || item.grade === Number(filters.grade));
      });
    }
  },

  getQuestionFilters: async (subjectCode = '', topic = '') => {
    try {
      const params = new URLSearchParams();
      if (subjectCode) params.set('subject_code', subjectCode);
      if (topic) params.set('topic', topic);
      const res = await client.get(`/questions/filters?${params.toString()}`);
      return res.data;
    } catch {
      if (!import.meta.env.DEV) throw new Error('Không thể tải bộ lọc câu hỏi.');
      const topicsBySubject = {
        toan: ['Hình học Oxyz', 'Khảo sát hàm số'],
        ly: ['Dao động cơ'],
        hoa: ['Este - Lipit'],
        sinh: [],
        anh: [],
      };
      const lessonsByTopic = {
        'Hình học Oxyz': ['Phương trình mặt phẳng'],
        'Khảo sát hàm số': ['Cực trị của hàm số', 'Đường tiệm cận', 'Giá trị lớn nhất, nhỏ nhất'],
        'Dao động cơ': ['Dao động điều hòa', 'Con lắc đơn'],
        'Este - Lipit': ['Phản ứng thủy phân este'],
      };
      const topics = subjectCode ? (topicsBySubject[subjectCode] || []) : [...new Set(Object.values(topicsBySubject).flat())];
      return {
        subjects: MOCK_SUBJECTS.map(({ code, name }) => ({ code, name })),
        topics,
        lessons: topic ? (lessonsByTopic[topic] || []) : [],
        grades: [12],
      };
    }
  },

  getQuestionById: async (id) => {
    try {
      const res = await client.get(`/questions/${id}`);
      return res.data;
    } catch (err) {
      return null;
    }
  },

  // RAG Explain
  explainQuestion: async (questionId, studentAnswer = null) => {
    try {
      const res = await client.post('/explain', {
        question_id: questionId,
        student_answer: studentAnswer
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  chatAboutQuestion: async (questionId, message, history = [], studentAnswer = null) => {
    const res = await client.post('/chat/explain', {
      question_id: questionId,
      message,
      history,
      student_answer: studentAnswer,
    });
    return res.data;
  },

  // Knowledge Documents
  loginAdmin: async (username, password) => {
    const res = await client.post('/auth/admin/login', { username, password });
    sessionStorage.setItem('moon_admin_token', res.data.access_token);
    return res.data;
  },

  loginAdminWithGoogle: async (credential) => {
    const res = await client.post('/auth/admin/google', { credential });
    sessionStorage.setItem('moon_admin_token', res.data.access_token);
    return res.data;
  },

  loginUserWithGoogle: async (credential) => {
    const res = await client.post('/auth/google', { credential });
    sessionStorage.setItem('moon_user_token', res.data.access_token);
    return res.data;
  },

  getMyProfile: async () => {
    const res = await client.get('/users/me');
    return res.data;
  },

  updateMyProfile: async (profile) => {
    const res = await client.patch('/users/me', profile);
    return res.data;
  },

  getMyHistory: async () => {
    const res = await client.get('/users/me/history?limit=100');
    return res.data;
  },

  getMyMistakes: async () => {
    const res = await client.get('/users/me/mistakes');
    return res.data;
  },

  getKnowledgeDocs: async () => {
    const res = await client.get('/knowledge/documents');
    return res.data;
  },

  uploadKnowledge: async (formData) => {
    const res = await client.post('/knowledge/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  seedSampleKnowledge: async () => {
    const res = await client.post('/knowledge/seed-sample');
    return res.data;
  },

  reindexKnowledge: async () => {
    const res = await client.post('/knowledge/reindex');
    return res.data;
  }
};
