import React, { Fragment } from "react";
import { Col, Container, Row } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import GreetingCard from "./GreetingCard";
import RecentChatsWidget from "./RecentChatsWidget";
import UpcomingMeetingsWidget from "./UpcomingMeetingsWidget";
import TaskProgressWidget from "./TaskProgressWidget";
import ActivityHoursWidget from "./ActivityHoursWidget";
import CalendarWidget from "./CalendarWidget";
import ActiveUsersWidget from "./ActiveUsersWidget";

const Dashboard = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle="Retrack" parent="Dashboard" title="Dashboard" />
      <Container fluid={true}>
        <Row>
          {/* Welcome Card */}
          <GreetingCard />

          {/* Recent Chats Summary */}
          <Col xxl="4" xl="6" md="6" className="col-ed-6 box-col-6">
            <RecentChatsWidget />
          </Col>

          {/* Upcoming Meetings */}
          <Col xxl="4" xl="6" md="6" className="col-ed-6 box-col-6">
            <UpcomingMeetingsWidget />
          </Col>

          {/* Task Progress */}
          <Col xxl="4" xl="6" md="6" className="col-ed-6 box-col-6">
            <TaskProgressWidget />
          </Col>

          {/* Calendar Widget */}
          <Col xxl="4" xl="6" md="6" className="col-ed-6 box-col-6">
            <CalendarWidget />
          </Col>

          {/* Activity Hours */}
          {/* <Col xxl="4" xl="6" md="6" className="col-ed-6 box-col-6">
            <ActivityHoursWidget />
          </Col> */}

          {/* Active Users */}
          <Col xxl="4" xl="6" md="6" className="col-ed-6 box-col-6">
            <ActiveUsersWidget />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Dashboard;
