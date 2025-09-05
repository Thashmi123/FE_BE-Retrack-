import axios from "axios";

const API_BASE_URL = "http://localhost:8887/MeetingMgt/api";

// Alias for getAllMeetings to match the expected method name in Meeting component
const findAllMeetings = () => {
  return axios.get(`${API_BASE_URL}/FindallMeeting`);
};

const getAllMeetings = () => {
  return axios.get(`${API_BASE_URL}/FindallMeeting`);
};

const getMeetingById = (id) => {
  return axios.get(`${API_BASE_URL}/FindMeeting?meetingId=${id}`);
};

const createMeeting = (meeting) => {
  return axios.post(`${API_BASE_URL}/CreateMeeting`, meeting);
};

const updateMeeting = (id, meeting) => {
  return axios.put(`${API_BASE_URL}/UpdateMeeting?id=${id}`, meeting);
};

const deleteMeeting = (id) => {
  return axios.delete(`${API_BASE_URL}/DeleteMeeting?id=${id}`);
};

const meetingService = {
  findAllMeetings,
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
};

export default meetingService;
