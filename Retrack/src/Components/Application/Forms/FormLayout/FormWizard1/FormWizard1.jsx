import React, { Fragment } from 'react';
import StepZilla from 'react-stepzilla';
import Registration from './Registration';
import Email from './Email';
import Birthdate from './Birthdate';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { FormWizardWithIcon } from '../../../../Constant';
import { Breadcrumbs } from '../../../../AbstractElements';
import HeaderCard from '../../../Common/Component/HeaderCard';

const FormWizard = () => {
    const steps =
        [
            { name: 'Step 1', component: <Registration /> },
            { name: 'Step 2', component: <Email /> },
            { name: 'Step 3', component: <Birthdate /> },

        ];
    return (
        <Fragment>
            <Breadcrumbs parent="Forms" mainTitle="Form Wizard" subParent='Form Layout' title="Form Wizard" />
            <Container fluid={true}>
                <Row>
                    <Col sm="12">
                        <Card>
                            <HeaderCard title={FormWizardWithIcon} />
                            <CardBody>
                                <StepZilla
                                    steps={steps}
                                    showSteps={true}
                                    showNavigation={true}
                                    stepsNavigation={true}
                                    prevBtnOnLastStep={true}
                                    dontValidate={true} />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>


        </Fragment>
    );
};

export default FormWizard;