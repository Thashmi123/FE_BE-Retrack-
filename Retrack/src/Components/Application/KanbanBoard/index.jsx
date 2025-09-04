import React, { Fragment } from 'react';
import { Breadcrumbs } from '../../../AbstractElements';
import TaskKanbanBoard from './TaskKanbanBoard';
import { Container, Row, Col } from 'reactstrap';

const KanbanBoardContain = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle='Scrum Board' parent='Apps' title='Scrum Board' />
      <Container fluid={true} className='jkanban-container'>
        <Row>
          <Col xs='12'>
            <TaskKanbanBoard />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};
export default KanbanBoardContain;
