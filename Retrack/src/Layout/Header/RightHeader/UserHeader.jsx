// import React, { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FileText, LogIn, Mail, User } from "react-feather";
// import man from "../../../assets/images/dashboard/profile.png";

// import { LI, UL, Image, P } from "../../../AbstractElements";
// import CustomizerContext from "../../../_helper/Customizer";
// import { Account, Admin, Inbox, LogOut, Taskboard } from "../../../Constant";

// const UserHeader = () => {
//   const history = useNavigate();
//   const [profile, setProfile] = useState("");
//   const [name, setName] = useState("Emay Walter");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const { layoutURL } = useContext(CustomizerContext);
//   const authenticated = JSON.parse(localStorage.getItem("authenticated"));
//   const auth0_profile = JSON.parse(localStorage.getItem("auth0_profile"));

//   useEffect(() => {
//     setProfile(localStorage.getItem("profileURL") || man);
//     setName(localStorage.getItem("Name") ? localStorage.getItem("Name") : name);
//   }, []);

//   const Logout = () => {
//     localStorage.removeItem("profileURL");
//     localStorage.removeItem("token");
//     localStorage.removeItem("auth0_profile");
//     localStorage.removeItem("Name");
//     localStorage.setItem("authenticated", false);
//     setIsDropdownOpen(false);
//     history("/login");
//   };

//   const UserMenuRedirect = (redirect) => {
//     setIsDropdownOpen(false);
//     history(redirect);
//   };

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   return (
//     <LI attrLi={{ className: "onhover-dropdown profile-dropdown" }}>
//       <div className="media profile-media" onClick={toggleDropdown}>
//         <Image
//           attrImage={{ className: "b-r-10", src: `${profile}`, alt: "" }}
//         />
//         <div className="media-body">
//           <span>{name}</span>
//           <P attrPara={{ className: "mb-0 font-roboto" }}>
//             {authenticated ? "Admin" : "User"}{" "}
//             <i className="middle fa fa-angle-down"></i>
//           </P>
//         </div>
//       </div>
//       <UL
//         attrUl={{
//           className: `profile-dropdown onhover-show-div ${
//             isDropdownOpen ? "show" : ""
//           }`,
//           style: { display: isDropdownOpen ? "block" : "none" },
//         }}
//       >
//         <LI
//           attrLi={{
//             onClick: () =>
//               UserMenuRedirect("/components/application/users/users-edit"),
//           }}
//         >
//           <User />
//           <span>{Account}</span>
//         </LI>
//         <LI attrLi={{ onClick: () => UserMenuRedirect("/app/email-app") }}>
//           <Mail />
//           <span>{Inbox}</span>
//         </LI>
//         <LI attrLi={{ onClick: () => UserMenuRedirect("/app/todo-app/todo") }}>
//           <FileText />
//           <span>{Taskboard}</span>
//         </LI>
//         <LI attrLi={{ onClick: Logout }}>
//           <LogIn />
//           <span>{LogOut}</span>
//         </LI>
//       </UL>
//     </LI>
//   );
// };

// export default UserHeader;

import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn, Mail, User } from "react-feather";
import man from "../../../assets/images/dashboard/profile.png";

import { LI, UL, Image, P } from "../../../AbstractElements";
import CustomizerContext from "../../../_helper/Customizer";
import { Account, Admin, Inbox, LogOut, Taskboard } from "../../../Constant";
import { useUser } from "../../../contexts/UserContext";

const UserHeader = () => {
  const history = useNavigate();
  const [profile, setProfile] = useState("");
  const { user, logout } = useUser();
  const { layoutURL } = useContext(CustomizerContext);
  const authenticated = JSON.parse(localStorage.getItem("authenticated"));
  const auth0_profile = JSON.parse(localStorage.getItem("auth0_profile"));

  useEffect(() => {
    setProfile(localStorage.getItem("profileURL") || man);
  }, []);

  const Logout = () => {
    localStorage.removeItem("profileURL");
    localStorage.removeItem("token");
    localStorage.removeItem("auth0_profile");
    localStorage.removeItem("Name");
    localStorage.setItem("authenticated", false);
    logout(); // Call logout from UserContext
    history(`${process.env.PUBLIC_URL}/login`);
  };

  const UserMenuRedirect = (redirect) => {
    history(redirect);
  };

  return (
    <li className="profile-nav onhover-dropdown pe-0 py-0">
      <div className="media profile-media">
        <Image
          attrImage={{
            className: "b-r-10 m-0",
            src: `${authenticated ? auth0_profile.picture : profile}`,
            alt: "",
          }}
        />
        <div className="media-body">
          <span>{authenticated ? auth0_profile.name : (user ? `${user.FirstName} ${user.LastName}` : "User")}</span>
          <P attrPara={{ className: "mb-0 font-roboto" }}>
            {Admin} <i className="middle fa fa-angle-down"></i>
          </P>
        </div>
      </div>
      <UL
        attrUL={{ className: "simple-list profile-dropdown onhover-show-div" }}
      >
        <LI
          attrLI={{
            onClick: () =>
              UserMenuRedirect("/components/application/users/users-edit"),
          }}
        >
          <User />
          <span>{Account} </span>
        </LI>
        <LI
          attrLI={{
            onClick: () => UserMenuRedirect(`/app/email-app`),
          }}
        >
          <Mail />
          <span>{Inbox}</span>
        </LI>
        <LI
          attrLI={{
            onClick: () => UserMenuRedirect(`/app/todo-app/todo`),
          }}
        >
          <FileText />
          <span>{Taskboard}</span>
        </LI>
        <LI attrLI={{ onClick: Logout }}>
          <LogIn />
          <span>{LogOut}</span>
        </LI>
      </UL>
    </li>
  );
};

export default UserHeader;
