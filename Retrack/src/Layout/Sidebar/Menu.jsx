export const MENUITEMS = [
  {
    menutitle: "ReTrack",
    menucontent: "Dashboards,Widgets",
    Items: [
      {
        title: "Dashboard",
        icon: "home",
        type: "link",
        path: "/pages/dashboard",
      },
      {
        title: "Chats",
        icon: "chat",
        path: "/app/chat-app/chats",
        type: "link",
      },
      {
        title: "Meetings",
        icon: "calendar",
        type: "sub",
        children: [
          {
            path: "/components/application/meeting",
            type: "link",
            title: "Meeting List",
          },
          {
            path: "/components/application/meeting/room",
            type: "link",
            title: "Meeting Room",
          },
          {
            path: "/components/application/meeting/chat",
            type: "link",
            title: "Meeting Chat",
          },
        ],
      },
      {
        path: `components/application/task`,
        icon: "task",
        type: "link",
        title: "Task",
      },
      {
        path: `components/application/kanbanboard`,
        icon: "editors",
        type: "link",
        title: "Scrumboard",
      },
      {
        title: "Calendar",
        icon: "calendar",
        type: "link",
        path: "/app/calendar",
      },
      {
        title: "Users",
        icon: "user",
        type: "link",
        path: "/components/application/users/users-edit",
      },
      {
        title: "Account Settings",
        icon: "support-tickets",
        type: "link",
        path: "/components/application/users/account-settings",
      },

      // {
      //   title: "Support Ticket",
      //   icon: "support-tickets",
      //   type: "sub",
      // children: [
      //   {
      //     active: false,
      //     path: `http://support.pixelstrap.com/help-center`,
      //     title: "Help Center",
      //     type: "link",
      //   },
      // ],
      // },
    ],
  },
];
