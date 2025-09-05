import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, CardHeader } from "reactstrap";
import EnhancedNotificationbar from "./EnhancedNotificationbar";

// Test component to verify notification functionality
const NotificationTest = () => {
  const [showTest, setShowTest] = useState(false);

  return (
    <div className="p-3">
      <Card>
        <CardHeader>
          <h5>Notification System Test</h5>
        </CardHeader>
        <CardBody>
          <p>
            This component tests the enhanced notification system with meeting
            and task reminders.
          </p>
          <Button color="primary" onClick={() => setShowTest(!showTest)}>
            {showTest ? "Hide" : "Show"} Notification Test
          </Button>

          {showTest && (
            <div className="mt-3">
              <h6>Test Notification Component:</h6>
              <div className="border p-3 rounded">
                <EnhancedNotificationbar />
              </div>
              <div className="mt-3">
                <h6>Features to test:</h6>
                <ul>
                  <li>
                    ✅ Removed search, bookmarks, and option elements from
                    header
                  </li>
                  <li>✅ Added meeting reminder notifications</li>
                  <li>✅ Added urgent task notifications</li>
                  <li>✅ Priority-based notification sorting</li>
                  <li>✅ Real-time notification updates (every 5 minutes)</li>
                  <li>✅ Clickable notifications for navigation</li>
                  <li>✅ Visual urgency indicators (colors, icons)</li>
                </ul>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default NotificationTest;
