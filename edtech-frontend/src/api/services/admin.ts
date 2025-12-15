import request from '../request';

// Admin API Services

export interface DashboardStats {
  totalUsers: number;
  dailyActive: number;
  totalQuestions: number;
  aiCalls: number;
  userGrowth: number;
  questionGrowth: number;
}

export interface AdminUser {
  id: number;
  username: string;
  nickname: string;
  email: string;
  grade: string;
  totalPoints: number;
  masteryLevel: number;
  lastActive: string;
  createdAt: string;
}

export interface KnowledgePoint {
  id: number;
  name: string;
  subject: string;
  description: string;
  parentId: number | null;
  pInit: number;
  pTransit: number;
  pGuess: number;
  pSlip: number;
  prerequisites: number[];
}

// Login
export async function adminLogin(username: string, password: string) {
  return request.post('/api/admin/login', { username, password });
}

// Dashboard
export async function getDashboardStats() {
  return request.get('/api/admin/dashboard');
}

// Users
export async function getUsers(page: number, size: number, search: string) {
  return request.get(`/api/admin/users?page=${page}&size=${size}&search=${search}`);
}

export async function getUserDetail(id: number) {
  return request.get(`/api/admin/users/${id}`);
}

// Knowledge Points
export async function getKnowledgePoints() {
  return request.get('/api/admin/knowledge-points');
}

export async function saveKnowledgePoint(data: Partial<KnowledgePoint>) {
  return request.post('/api/admin/knowledge-points', data);
}

export async function deleteKnowledgePoint(id: number) {
  return request.delete(`/api/admin/knowledge-points/${id}`);
}

// Prompts
export async function previewPrompt(template: string, variables: Record<string, unknown>) {
  return request.post('/api/admin/prompts/preview', { template, variables });
}

// Logs
export async function getLogs(type: string, page: number, size: number) {
  return request.get(`/api/admin/logs?type=${type}&page=${page}&size=${size}`);
}
