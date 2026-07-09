import React from "react";
import Navbar from "../../components/Navbar";

const UserDashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>User Dashboard</h1>
        <p>Loading stores...</p>
      </div>
    </div>
  );
};

export default UserDashboard;
