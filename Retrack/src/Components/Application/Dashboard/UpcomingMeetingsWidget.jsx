import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Badge, Button } from "reactstrap";
import { H5 } from "../../../AbstractElements";
import MeetingService from "../../../Services/meeting.service";
import { Link } from "react-router-dom";

const UpcomingMeetingsWidget = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      console.log("Loading meetings...");
      const response = await MeetingService.findAllMeetings();
      console.log("Meetings response:", response);

      const meetingsData = response.data?.Meeting || response.data || [];
      console.log("Meetings data:", meetingsData);

      // Show all meetings, not just upcoming ones
      const allMeetings = meetingsData.sort(
        (a, b) => new Date(a.Date) - new Date(b.Date)
      );

      console.log("All meetings:", allMeetings);
      setMeetings(allMeetings);
    } catch (err) {
      console.error("Error loading meetings:", err);
      // Show sample data when API fails
      const sampleMeetings = [
        {
          MeetingId: "sample-1",
          Title: "Team Standup",
          Date: new Date().toISOString().split("T")[0],
          StartTime: "09:00",
          EndTime: "09:30",
          Participants: "John, Jane, Mike",
        },
        {
          MeetingId: "sample-2",
          Title: "Project Review",
          Date: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          StartTime: "14:00",
          EndTime: "15:00",
          Participants: "Team Lead, Developers",
        },
      ];
      setMeetings(sampleMeetings);
    } finally {
      setLoading(false);
    }
  };

  const formatMeetingTime = (date, startTime, endTime) => {
    const meetingDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr;
    if (meetingDate.toDateString() === today.toDateString()) {
      dateStr = "Today";
    } else if (meetingDate.toDateString() === tomorrow.toDateString()) {
      dateStr = "Tomorrow";
    } else {
      dateStr = meetingDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return `${dateStr} at ${startTime} - ${endTime}`;
  };

  const getMeetingStatus = (date, startTime) => {
    const now = new Date();
    const meetingDateTime = new Date(`${date} ${startTime}`);

    if (meetingDateTime < now) {
      return { color: "secondary", text: "Past" };
    }

    const timeDiff = meetingDateTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 1) {
      return { color: "danger", text: "Starting Soon" };
    } else if (hoursDiff < 24) {
      return { color: "warning", text: "Today" };
    } else {
      return { color: "success", text: "Upcoming" };
    }
  };

  return (
    <Card className="upcoming-meetings-widget border-0 shadow-sm">
      <CardHeader className="card-no-border bg-fluent-success text-white">
        <div className="header-top">
          <H5 className="text-white mb-0">
            <i className="fa fa-calendar me-2"></i>Upcoming Meetings
          </H5>
          <Link
            to="/components/application/meeting"
            className="btn btn-sm btn-light"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {loading ? (
          <div className="text-center py-3">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading meetings...</p>
          </div>
        ) : meetings.length > 0 ? (
          <div
            className="meetings-list custom-scrollbar"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {meetings.map((meeting) => {
              const status = getMeetingStatus(meeting.Date, meeting.StartTime);
              return (
                <div
                  key={meeting.MeetingId}
                  className="meeting-item p-3 mb-2 rounded-3 border-0 shadow-sm"
                  style={{
                    background: "#ffc107",
                    color: "white",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 10px rgba(0,0,0,0.1)";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-1 text-white fw-bold">{meeting.Title}</h6>
                    <Badge color={status.color} size="sm" className="fw-bold">
                      {status.text}
                    </Badge>
                  </div>
                  <p className="mb-1 small text-dark">
                    <i className="fa fa-clock me-1"></i>
                    {formatMeetingTime(
                      meeting.Date,
                      meeting.StartTime,
                      meeting.EndTime
                    )}
                  </p>
                  {meeting.Participants && (
                    <p className="mb-0 small text-dark">
                      <i className="fa fa-users me-1"></i>
                      {meeting.Participants}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">No upcoming meetings</p>
            <Button color="primary" size="sm">
              Schedule Meeting
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default UpcomingMeetingsWidget;
