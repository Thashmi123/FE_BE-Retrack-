import React, { Fragment } from 'react';
import { Col, Card, TabContent, TabPane } from 'reactstrap';
// import { TodayTasks, DelayedTasks, UpcomingTasks, ThisWeekTask, ThisMonthTasks, AssignedToMe, MyTasks, Newsletter, Business, Holidays, Notification } from '../../../Constant';
// import ListOfTask from './ListTask';
// import EmptyTaskClass from './EmptyTaskClass';
// import AssignedToMeClass from './AssignedToMe';
import EnhancedTaskList from './EnhancedTaskList';

const TabClass = ({ activeTab }) => {

    return (
        <Fragment>
            <Col xl="9" md="12" className="box-col-8">
                <div className="email-right-aside bookmark-tabcontent">
                    <Card className="email-body radius-left">
                        <div className="ps-0">
                            <TabContent activeTab={activeTab}>
                                {/* <TabPane tabId="1">
                                    <EnhancedTaskList activeFilter="createdByMe" />
                                </TabPane> */}
                                <TabPane tabId="2">
                                    <EnhancedTaskList activeFilter="today" />
                                </TabPane>
                                <TabPane tabId="3">
                                    <EnhancedTaskList activeFilter="delayed" />
                                </TabPane>
                                <TabPane tabId="4">
                                    <EnhancedTaskList activeFilter="upcoming" />
                                </TabPane>
                                <TabPane tabId="5">
                                    <EnhancedTaskList activeFilter="thisWeek" />
                                </TabPane>
                                <TabPane tabId="1">
                                    <EnhancedTaskList activeFilter="thisMonth" />
                                </TabPane>
                                <TabPane tabId="6">
                                    <EnhancedTaskList activeFilter="assignedToMe" />
                                </TabPane>
                                <TabPane tabId="7">
                                    <EnhancedTaskList activeFilter="myTasks" />
                                </TabPane>
                                {/* <TabPane tabId="9">
                                    <EnhancedTaskList tagFilter="Notification" />
                                </TabPane>
                                <TabPane tabId="10">
                                    <EnhancedTaskList tagFilter="Newsletter" />
                                </TabPane>
                                <TabPane tabId="11">
                                    <EnhancedTaskList tagFilter="Business" />
                                </TabPane>
                                <TabPane tabId="12">
                                    <EnhancedTaskList tagFilter="Holidays" />
                                </TabPane> */}
                            </TabContent>
                        </div>
                    </Card>
                </div>
            </Col>
        </Fragment>
    );
};

export default TabClass;