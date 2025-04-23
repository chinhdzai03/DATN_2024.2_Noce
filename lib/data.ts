import dayjs from "dayjs";


// Dummy event data for demonstration
export const monthEvents = [
    {id: "ascx34", date: dayjs(), title: "Meeting with team", description: "We are meeting" },
    {id: "ascx35", date: dayjs().hour(10), title: "Code review", description: "We are meeting for code review"  },
    {id: "ascx36", date: dayjs().add(3, "day"), title: "Project deadline", description: "We are meeting"  },
    // More events
  ];


  export const weekEvents = [
    {id: "ascx34", date: dayjs().hour(10), title: "Meeting with team", description: "We are meeting" },
    {id: "ascx35", date: dayjs().add(3, "day").hour(14), title: "Project deadline", description: "We are meeting" },
  ];


  export const dayEvents = [
    {id: "ascx34", date: dayjs().hour(10), title: "Meeting with team", description: "We are meeting" },
    {id: "ascx35", date: dayjs().hour(14), title: "Project deadline", description: "We are meeting" },
  ];
