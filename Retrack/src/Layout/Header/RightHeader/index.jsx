import React, { Fragment } from "react";

import Language from "./Language";
import EnhancedNotificationbar from "./EnhancedNotificationbar";
import MoonLight from "./MoonLight";
import CartHeader from "./CartHeader";
import UserHeader from "./UserHeader";
import { UL } from "../../../AbstractElements";
import { Col } from "reactstrap";

const RightHeader = () => {
  return (
    <Fragment>
      <Col
        xxl="7"
        xl="6"
        md="7"
        className="nav-right pull-right right-header col-8 p-0 ms-auto"
      >
        {/* <Col md="8"> */}
        <UL attrUL={{ className: "simple-list nav-menus flex-row" }}>
          {/* <Language /> */}
          <MoonLight />
          {/* <CartHeader /> */}
          <EnhancedNotificationbar />
          <UserHeader />
        </UL>
        {/* </Col> */}
      </Col>
    </Fragment>
  );
};

export default RightHeader;
