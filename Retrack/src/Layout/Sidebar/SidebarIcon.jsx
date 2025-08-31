import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Image } from "../../AbstractElements";
import CustomizerContext from "../../_helper/Customizer";
import logoIcon from "../../assets/images/logo/logo-icon.png";

const SidebarIcon = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const layout = layoutURL || "compact-wrapper";

  return (
    <div className="logo-wrapper">
      <Link to={`/pages/sample-page/${layout}`}>
        <Image attrImage={{ className: "img-fluid", src: logoIcon, alt: "" }} />
      </Link>
    </div>
  );
};

export default SidebarIcon;
