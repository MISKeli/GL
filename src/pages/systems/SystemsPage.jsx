import React from "react";
import { Outlet, useParams } from "react-router-dom";
import "../../styles/SystemsPage.scss";

function SystemsPage() {
  const params = useParams();

  const { name, section, to } = params;

  return (
    <>
      <Outlet context={{ name, section, to }} />
    </>
  );
}

export default SystemsPage;
