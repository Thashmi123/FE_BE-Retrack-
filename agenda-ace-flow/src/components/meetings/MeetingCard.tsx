import { Calendar, Clock, MapPin, Users, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  location?: string;
  isOnline: boolean;
  status: "upcoming" | "in-progress" | "completed";
}

interface MeetingCardProps {
  meeting: Meeting;
  onJoin?: () => void;
  onEdit?: () => void;
}

export function MeetingCard({ meeting, onJoin, onEdit }: MeetingCardProps) {
  const getStatusBadge = () => {
    switch (meeting.status) {
      case "upcoming":
        return <Badge variant="default">Upcoming</Badge>;
      case "in-progress":
        return <Badge variant="destructive">In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{meeting.title}</CardTitle>
            {getStatusBadge()}
          </div>
          <div className="flex gap-2">
            {meeting.status === "upcoming" && onJoin && (
              <Button size="sm" onClick={onJoin}>
                {meeting.isOnline ? "Join" : "View"}
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{meeting.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{meeting.time} ({meeting.duration})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{meeting.attendees} attendees</span>
          </div>
          <div className="flex items-center gap-1">
            {meeting.isOnline ? (
              <>
                <Video className="w-4 h-4" />
                <span>Online Meeting</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>{meeting.location || "TBD"}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}