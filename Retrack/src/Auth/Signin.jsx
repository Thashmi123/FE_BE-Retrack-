import React from "react";
import { Container, Row, Col } from "reactstrap";
import LoginTab from "./Tabs/LoginTab";

const Logins = () => {
  return (
    <Container fluid={true} className="p-0 login-page">
      <Row>
        <Col xs="12">
          <LoginTab selected="simpleLogin" />
        </Col>
      </Row>
    </Container>
  );
};

export default Logins;
