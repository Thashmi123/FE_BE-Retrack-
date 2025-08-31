import React, { Fragment } from 'react';
import { Container, Row, Col, Card, CardBody, Form } from 'reactstrap';
import TimePickerTwo from './TimePickerTwo';
import TimePickerOne from './TimePickerOne';
import TimePickerThree from './TimePickerThree';
import { Default, TimePickerDarkTheme, SetMultipleTimepicker } from '../../../../Constant';
import { Breadcrumbs } from '../../../../AbstractElements';
import HeaderCard from '../../../Common/Component/HeaderCard';

const Timepicker = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle='Time Picker' subParent='Forms Widgets' parent="Forms" title="Time Picker" />
      <Container fluid={true} className="timepicker-form ">
        <Row>
          <Col xl="6">
            <Card>
              <HeaderCard title={Default} />
              <CardBody>
                <Form className="theme-form">
                  <div>
                    <TimePickerTwo />
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
          <Col xl="6">
            <Card>
              <HeaderCard title={TimePickerDarkTheme} />
              <CardBody>
                <Form className="theme-form">
                  <div>
                    <TimePickerOne />
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
          {/* <Col xl="6" className='xl-100'>
            <Card>
              <HeaderCard title={SetClassicTheme} />
              <CardBody>
                <Form className="theme-form">
                  <div>
                    <TimePickerFour />
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col> */}
          <Col xl="6" className='xl-100 box-col-12'>
            <Card>
              <HeaderCard title={SetMultipleTimepicker} />
              <CardBody>
                <div className="clearfix">
                  <Form className="theme-form">
                    <div className="mb-0">
                      <TimePickerThree />
                    </div>
                  </Form>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Timepicker;