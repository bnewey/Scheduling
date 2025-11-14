// pages/mobile.js
import React from "react";
import MainLayout from "../components/Layouts/Main";
import withAuth from "../server/lib/withAuth";
import MobileCrewJobs from "../components/Mobile/MobileCrewJobs";

function MobilePage({ user }) {
  return (
    <MainLayout>
      <MobileCrewJobs user={user} />
    </MainLayout>
  );
}

export default withAuth(MobilePage);