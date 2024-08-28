import React from "react";
import "../styles/NotFound.scss";

const Notfound = () => {
  return (
    <div className="error-container">
      {/* Error message */}
      <div className="error-message">
        <h1>Oops! Something went wrong.</h1>
        <p>We're sorry, but there was an error.</p>
        <p>Please try again later.</p>
      </div>
    </div>
  );
};

export default Notfound;
