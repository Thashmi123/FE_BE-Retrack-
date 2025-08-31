import React, { Fragment, useEffect, useState } from "react";
import { Settings } from "react-feather";
import { Link } from "react-router-dom";
import { H6, Image, LI, UL, P } from "../../AbstractElements";
import man from "../../assets/images/dashboard/1.png";
import { useUser } from "../../contexts/UserContext";

const Profile = () => {
  const { user } = useUser();
  const authenticated = JSON.parse(localStorage.getItem("authenticated"));
  const auth0_profile = JSON.parse(localStorage.getItem("auth0_profile"));
  const [profile, setProfile] = useState("");

  useEffect(() => {
    setProfile(localStorage.getItem("profileURL") || man);
  }, [setProfile]);

  // Get user name from context or fallback to existing values
  const getUserName = () => {
    if (user) {
      return `${user.FirstName} ${user.LastName}`;
    }
    if (authenticated) {
      return auth0_profile.name;
    }
    return localStorage.getItem("Name") || "User";
  };

  return (
    <Fragment>
      <div className="sidebar-user text-center">
        <a className="setting-primary" href="#javascript">
          <Settings />
        </a>
        <Link to="/app/users/userProfile">
          <Image
            attrImage={{
              className: "img-90 rounded-circle",
              src: authenticated ? auth0_profile.picture : profile,
              alt: "",
            }}
          />
          <H6 attrH6={{ className: "mt-3 f-14 f-w-600" }}>
            {getUserName()}
          </H6>
        </Link>
        {/* <P attrPara={{ className: 'mb-0 font-roboto' }} >Human Resources Department</P> */}
        <UL attrUL={{ className: "flex-row simple-list" }}>
          <LI>
            <span>
              <span className="counter">19.8</span>k
            </span>
            <P>Follow</P>
          </LI>
          <LI>
            <span>2 year</span>
            <P>Experince</P>
          </LI>
          <LI>
            <span>
              <span className="counter">95.2</span>k
            </span>
            <P>Follower </P>
          </LI>
        </UL>
      </div>
    </Fragment>
  );
};

export default Profile;
