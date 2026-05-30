import api from './api';

export const profileService = {
  getMyProfile: () => api.get('/profiles/me'),
  getPublicProfile: (userId) => api.get(`/profiles/public/${userId}`),
  updateProfile: (userId, data) => api.put(`/profiles/${userId}`, data),
  uploadAvatar: (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post(`/profiles/${userId}/upload-avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadBanner: (userId, file) => {
    const formData = new FormData();
    formData.append('banner', file);
    return api.post(`/profiles/${userId}/upload-banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const skillsService = {
  getAllSkills: () => api.get('/skills'),
  getUserSkills: () => api.get('/skills/user'),
  addUserSkill: (data) => api.post('/skills/user', data),
  updateUserSkill: (skillId, data) => api.put(`/skills/user/${skillId}`, data),
  deleteUserSkill: (skillId) => api.delete(`/skills/user/${skillId}`)
};

export const portfolioService = {
  getMyPortfolio: () => api.get('/portfolio'),
  createProject: (data) => api.post('/portfolio', data),
  updateProject: (projectId, data) => api.put(`/portfolio/${projectId}`, data),
  deleteProject: (projectId) => api.delete(`/portfolio/${projectId}`),
  uploadProjectImage: (projectId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/portfolio/${projectId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  toggleFeatured: (projectId, isFeatured) => api.patch(`/portfolio/${projectId}/featured`, { isFeatured }),
};
