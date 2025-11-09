import axios from 'axios';

const BASE_URL = 'http://localhost:3000/tasks';

export const getTasks = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const createTask = async (task) => {
  const response = await axios.post(BASE_URL, task);
  return response.data;
};

export const updateTask = async (id, data) => {
  const response = await axios.patch(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};
