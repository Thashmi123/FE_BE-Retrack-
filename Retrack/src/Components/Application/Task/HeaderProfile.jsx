import React, { Fragment, useContext } from "react";
import { Link } from "react-router-dom";
import { H6, Image, P } from "../../../AbstractElements";
import CustomizerContext from "../../../_helper/Customizer";
import { useUser } from "../../../contexts/UserContext"; // ← your user context

const HeaderProfile = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const { user } = useUser(); // fetch user from context

  // fallback values in case context is empty
  const userName = user ? `${user.FirstName} ${user.LastName}` : "MARK JENCO";
  const userEmail = user ? user.Email : "markjenco@example.com";

  return (
    <Fragment>
      <div className="media align-items-center">
        <div className="media-size-email">
          <Image
            attrImage={{
              className: "me-3 rounded-circle",
              src: require("../../../assets/images/user/user.png"),
              alt: "user image",
            }}
          />
        </div>
        <div className="media-body">
          <Link
            to={`${process.env.PUBLIC_URL}/app/users/userprofile/${layoutURL}`}
          >
            <H6 attrH6={{ className: "f-w-600" }}>{userName}</H6>
          </Link>
          <P>{userEmail}</P>
        </div>
      </div>
    </Fragment>
  );
};

export default HeaderProfile;

// import React, { Fragment, useContext } from 'react';
// import { MARKJENCO, MARKJENCOEMAIL } from '../../../Constant';
// import { Link } from 'react-router-dom';
// import { H6, Image, P } from '../../../AbstractElements';
// import CustomizerContext from '../../../_helper/Customizer';

// const HeaderProfile = () => {
//     const { layoutURL } = useContext(CustomizerContext);
//     return (
//         <Fragment>
//             <div className="media align-items-center">
//                 <div className="media-size-email">
//                     <Image attrImage={{ className: 'me-3 rounded-circle', src: `${require('../../../assets/images/user/user.png')}`, alt: '' }} />
//                 </div>
//                 <div className="media-body">
//                     <Link to={`${process.env.PUBLIC_URL}/app/users/userprofile/${layoutURL}`}>
//                         <H6 attrH6={{ className: 'f-w-600' }} >{MARKJENCO}</H6></Link>
//                     <P>{MARKJENCOEMAIL}</P>
//                 </div>
//             </div>
//         </Fragment>
//     );
// };

// export default HeaderProfile;
