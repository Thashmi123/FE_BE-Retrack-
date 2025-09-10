import React, { Fragment } from 'react';
import { Breadcrumbs, H5, P } from '../../../AbstractElements';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';

const SamplePage = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle='Dashboard' parent='Pages' title='Dashboard' />
      <Container fluid={true}>
        <Row>
          <Col sm='12'>
            <Card>
              <CardHeader>
                <H5>Retrack</H5>
                <span>lManagement tool</span>
              </CardHeader>
              <CardBody>
                <P>
                one stop solution
                </P>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default SamplePage;
