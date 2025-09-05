import React, { useContext } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { H3, H6, P } from "../../../AbstractElements";
import { useUser } from "../../../contexts/UserContext";
import { useMessage } from "../../../contexts/MessageContext";

const GreetingCard = () => {
  const { user } = useUser();
  const { getTotalUnreadCount } = useMessage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.name || user?.Name || user?.username || "User";
  const totalUnread = getTotalUnreadCount ? getTotalUnreadCount() : 0;

  return (
    <Card
      className="greeting-card border-0 shadow-sm"
      style={{
        background: "var(--theme-deafult)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "200px",
          height: "200px",
          background:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='25' cy='25' r='1' fill='white' opacity='0.1'/%3E%3Ccircle cx='75' cy='75' r='1' fill='white' opacity='0.1'/%3E%3Ccircle cx='50' cy='10' r='0.5' fill='white' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grain)'/%3E%3C/svg%3E\")",
          opacity: 0.1,
          transform: "rotate(15deg) translate(50px, -50px)",
        }}
      ></div>
      <CardBody className="position-relative">
        <Row className="align-items-center">
          <Col md="8">
            <div className="greeting-content">
              <H3 className="mb-2 text-primary fw-bold">
                <i className="fa fa-sun-o me-2"></i>
                {getGreeting()}, {userName}!
              </H3>
              <P className="mb-0 text-body">
                Welcome back to your workspace. You have {totalUnread} unread
                messages.
              </P>
            </div>
          </Col>
          <Col md="4" className="text-end">
            <div className="greeting-stats">
              <div className="stat-item bg-primary bg-opacity-20 p-3 rounded-3">
                <H6 className="mb-1 text-body fw-bold">{totalUnread}</H6>
                <P className="mb-0 small text-body">Unread Messages</P>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default GreetingCard;
