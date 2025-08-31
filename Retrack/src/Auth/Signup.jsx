import React from "react";
import { Container, Row, Col } from "reactstrap";
import RegisterTab from "./Tabs/RegisterTab";

const Signup = () => {
  return (
    <Container fluid={true} className="p-0 login-page">
      <Row>
        <Col xs="12">
          <RegisterTab />
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;