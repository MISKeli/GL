import React from "react";
import NotFound from "../pages/NotFound";
import { useSelector } from "react-redux";

const AccessPermission = ({ children, permission }) => {
  const userData = useSelector((state) => JSON.parse(state.auth.user));
  //console.log("userdata", userData);

  // Directly access the access permissions from userData
  const rolePermissions = userData?.permission || [];
 // console.log(rolePermissions);
  const hasPermission = rolePermissions.includes(permission);
  //console.log({ hasPermission });
  if (hasPermission) {
    return <>{children}</>;
  } else {
    return <NotFound />;
  }
};

export default AccessPermission;
