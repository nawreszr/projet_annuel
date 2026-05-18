import axios from 'axios';

const isServer = typeof window === 'undefined';
let GATEWAY_URL = '';

if (isServer) {
  GATEWAY_URL = process.env.INTERNAL_GATEWAY_URL || 'http://nginx-gateway';
} else {
  GATEWAY_URL = window.location.port === '3000' ? 'http://localhost' : '';
}

const USER_SERVICE_URL = `${GATEWAY_URL}/api`;
const COURSE_SERVICE_URL = `${GATEWAY_URL}/api`;

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add token to requests
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export const authApi = {
  login: async (credentials: any) => {
    const response = await api.post(`${USER_SERVICE_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('nexus_token', response.data.token);
      localStorage.setItem('nexus_user', JSON.stringify(response.data.user));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'));
      }
    }
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post(`${USER_SERVICE_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('nexus_token', response.data.token);
      localStorage.setItem('nexus_user', JSON.stringify(response.data.user));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'));
      }
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('userUpdated'));
    }
  },
  getMe: async () => {
    const response = await api.get(`${USER_SERVICE_URL}/auth/me`);
    return response.data.user;
  },
  updateProfile: async (profileData: any) => {
    const response = await api.put(`${USER_SERVICE_URL}/auth/profile`, profileData);
    if (response.data.user) {
      localStorage.setItem('nexus_user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },
  getUsersBatch: async (userIds: string[]) => {
    const response = await api.post(`${USER_SERVICE_URL}/users/batch`, { userIds });
    return response.data.users;
  }
};

export const courseApi = {
  getCourses: async (instructorId?: string, enrolledOnly?: boolean) => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('nexus_user') : null;
    const userId = user ? JSON.parse(user)._id : null;
    
    let url = `${COURSE_SERVICE_URL}/courses`;
    const params = new URLSearchParams();
    if (instructorId) params.append('instructor_id', instructorId);
    if (userId) params.append('user_id', userId);
    if (enrolledOnly) params.append('enrolled_only', 'true');
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data.courses;
  },
  enroll: async (courseId: number) => {
    const user = localStorage.getItem('nexus_user');
    if (!user) throw new Error('User not logged in');
    const userId = JSON.parse(user)._id;
    
    const response = await api.post(`${COURSE_SERVICE_URL}/enroll`, {
      user_id: userId,
      course_id: courseId
    });
    return response.data;
  },
  createCourse: async (courseData: any) => {
    const response = await api.post(`${COURSE_SERVICE_URL}/courses`, courseData);
    return response.data;
  },
  getLessons: async (courseId: number) => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('nexus_user') : null;
    const userId = user ? JSON.parse(user)._id : null;
    
    const url = userId 
      ? `${COURSE_SERVICE_URL}/courses/${courseId}/lessons?user_id=${userId}`
      : `${COURSE_SERVICE_URL}/courses/${courseId}/lessons`;
      
    const response = await api.get(url);
    return response.data.lessons;
  },
  updateProgress: async (courseId: number, lessonId: number) => {
    const user = localStorage.getItem('nexus_user');
    if (!user) return;
    const userId = JSON.parse(user)._id;
    
    await api.post(`${COURSE_SERVICE_URL}/progress`, {
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId
    });
  },
  addLesson: async (courseId: number, lessonData: any) => {
    const response = await api.post(`${COURSE_SERVICE_URL}/courses/${courseId}/lessons`, lessonData);
    return response.data;
  },
  getCourse: async (courseId: number) => {
    const response = await api.get(`${COURSE_SERVICE_URL}/courses/${courseId}`);
    return response.data;
  },
  updateCourse: async (courseId: number, courseData: any) => {
    const response = await api.put(`${COURSE_SERVICE_URL}/courses/${courseId}`, courseData);
    return response.data;
  },
  deleteCourse: async (courseId: number) => {
    const response = await api.delete(`${COURSE_SERVICE_URL}/courses/${courseId}`);
    return response.data;
  },
  getInstructorEnrollments: async (instructorId: string) => {
    const response = await api.get(`${COURSE_SERVICE_URL}/enrollments/instructor/${instructorId}`);
    return response.data.enrollments;
  }
};

const AI_SERVICE_URL = `${GATEWAY_URL}/api/ai`;

export const aiApi = {
  ask: async (question: string) => {
    const user = localStorage.getItem('nexus_user');
    const userId = user ? JSON.parse(user)._id : 'guest';
    const response = await api.post(`${AI_SERVICE_URL}/ask`, {
      question,
      user_id: userId
    });
    return response.data;
  },
  generateQuiz: async (topic: string) => {
    const response = await api.post(`${AI_SERVICE_URL}/generate-quiz?course_topic=${topic}`);
    return response.data;
  }
};
