// //Sample Page
import ChatAppContain from "../Components/Application/Chat/ChatApp";
import VideoChatContain from "../Components/Application/Chat/VideoChat";
import OnlineCourse from "../Components/Application/OnlineCourse";
import Task from "../Components/Application/Task";
import UsersEditContain from "../Components/Application/Users/UsersEdit";
import AccountSettings from "../Components/Application/Users/AccountSettings";
import SamplePage from "../Components/Pages/PageLayout/SimplePage";
import Meeting from "../Components/Application/Meeting";
import MeetingRoom from "../Components/Application/Meeting/MeetingRoom";
import MeetingChat from "../Components/Application/Meeting/MeetingChat";
import DraggableContain from "../Components/Application/Calender/DraggableCalender";
import KanbanBoardContain from "../Components/Application/KanbanBoard";

export const routes = [
  // Dashboard
  {
    path: "pages/dashboard",
    Component: <OnlineCourse />,
  },
  // Sample page (default route)
  {
    path: "pages/sample-page/:layout",
    Component: <SamplePage />,
  },
  {
    path: "app/calendar",
    Component: <DraggableContain />,
  },
  // Users
  {
    path: "components/application/users/users-edit",
    Component: <UsersEditContain />,
  },
  {
    path: "components/application/users/account-settings",
    Component: <AccountSettings />,
  },
  // Chat routes
  {
    path: "app/chat-app/chats",
    Component: <ChatAppContain />,
  },
  {
    path: "app/chat-app/chat-video-app",
    Component: <VideoChatContain />,
  },
  // Alternative chat paths for compatibility
  {
    path: "components/application/chat-app/chats",
    Component: <ChatAppContain />,
  },
  {
    path: "components/application/chat-app/video-chat",
    Component: <VideoChatContain />,
  },
  // Meeting routes
  {
    path: "components/application/meeting",
    Component: <Meeting />,
  },
  {
    path: "components/application/meeting/room",
    Component: <MeetingRoom />,
  },
  {
    path: "components/application/meeting/chat",
    Component: <MeetingChat />,
  },
  {
    path: "components/application/task",
    Component: <Task />,
  },
  {
    path: "components/application/kanbanboard",
    Component: <KanbanBoardContain />,
  },
];
