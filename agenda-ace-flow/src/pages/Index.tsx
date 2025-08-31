import { Calendar, CheckSquare, Users, BarChart3, ArrowRight, Clock, Video, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { TaskCard } from "@/components/tasks/TaskCard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import heroImage from "@/assets/hero-meeting.jpg";

// Mock data
const stats = [
  { title: "Upcoming Meetings", value: 12, change: "+2 from last week", changeType: "positive" as const, icon: Calendar },
  { title: "Pending Tasks", value: 24, change: "-3 from yesterday", changeType: "positive" as const, icon: CheckSquare },
  { title: "Team Members", value: 48, change: "+5 this month", changeType: "positive" as const, icon: Users },
  { title: "Completion Rate", value: "94%", change: "+2.1% from last month", changeType: "positive" as const, icon: BarChart3 },
];

const upcomingMeetings = [
  {
    id: "1",
    title: "Q4 Planning Meeting",
    date: "Today",
    time: "2:00 PM",
    duration: "1 hour",
    attendees: 8,
    isOnline: true,
    status: "upcoming" as const,
  },
  {
    id: "2", 
    title: "Product Review",
    date: "Tomorrow",
    time: "10:00 AM",
    duration: "45 min",
    attendees: 5,
    location: "Conference Room A",
    isOnline: false,
    status: "upcoming" as const,
  },
  {
    id: "3",
    title: "Team Standup",
    date: "Dec 20",
    time: "9:00 AM", 
    duration: "30 min",
    attendees: 12,
    isOnline: true,
    status: "upcoming" as const,
  },
];

const recentTasks = [
  {
    id: "1",
    title: "Prepare Q4 budget proposal",
    description: "Create detailed budget breakdown for next quarter",
    assignee: "Sarah Johnson",
    dueDate: "Dec 22, 2024",
    priority: "high" as const,
    status: "in-progress" as const,
    meetingTitle: "Q4 Planning Meeting",
  },
  {
    id: "2",
    title: "Update product roadmap",
    assignee: "Mike Chen",
    dueDate: "Dec 25, 2024",
    priority: "medium" as const,
    status: "pending" as const,
    meetingTitle: "Product Review",
  },
  {
    id: "3",
    title: "Schedule team interviews",
    assignee: "Lisa Wang",
    dueDate: "Dec 18, 2024",
    priority: "low" as const,
    status: "completed" as const,
  },
];

const Index = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <Button variant="default" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Transform Your
                  <span className="block text-secondary-accent">Meeting Culture</span>
                </h1>
                <p className="text-xl opacity-90 leading-relaxed">
                  Streamline scheduling, boost accountability, and turn every meeting into actionable results with Agenda Ace Flow.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="secondary" className="group">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Video className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Professional team meeting with digital collaboration tools"
                  className="rounded-lg shadow-2xl"
                />
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-accent/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-light/20 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="container mx-auto px-6 pb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upcoming Meetings */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <MeetingCard 
                    key={meeting.id} 
                    meeting={meeting}
                    onJoin={() => console.log('Join meeting:', meeting.id)}
                    onEdit={() => console.log('Edit meeting:', meeting.id)}
                  />
                ))}
              </div>
            </section>

            {/* Recent Tasks */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Tasks</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onStatusChange={(taskId, completed) => 
                      console.log('Task status changed:', taskId, completed)
                    }
                    onEdit={() => console.log('Edit task:', task.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="bg-muted/50 border-t">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
              <p className="text-muted-foreground">Get things done faster</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Schedule Meeting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    Create a new meeting with automated invitations
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-secondary-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-accent/20 transition-colors">
                    <CheckSquare className="w-6 h-6 text-secondary-accent" />
                  </div>
                  <CardTitle>Create Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    Assign tasks with deadlines and priorities
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 transition-colors">
                    <Zap className="w-6 h-6 text-success" />
                  </div>
                  <CardTitle>View Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    Track team performance and meeting insights
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </SidebarProvider>
  );
};

export default Index;
