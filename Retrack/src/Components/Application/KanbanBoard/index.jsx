import React, { Fragment } from 'react';
import { Breadcrumbs, H5, P } from '../../../AbstractElements';
import ApiBoard from './ApiBoard';
import CustomeBoard from './CustomeBoard';
import DefaultBoard from './DefaultBoard';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';

const KanbanBoardContain = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle='Kanban Board' parent='Apps' title='Kanban Board' />
      <Container fluid={true} className='jkanban-container'>
        <Row>
          <Col xs='12'>
            <DefaultBoard />
          </Col>
          <Col xs='12'>
            <CustomeBoard />
          </Col>
          <Col xs='12'>
            <Card>
              <CardHeader>
                <H5>API</H5>
                <P attrPara={{ className: 'mb-0' }}>{' add item, add board, delete board: '}</P>
              </CardHeader>
              <CardBody>
                <ApiBoard />
              </CardBody>
            </Card>
          </Col>
          <div id='mydata'></div>
        </Row>
      </Container>
    </Fragment>
  );
};
export default KanbanBoardContain;
