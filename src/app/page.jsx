import React from "react";
import CustomerReview from "./about/review/page";

import CreateGroupModal from "@/components/CreateGroupModal";


export default function HomePage() {
  return (
    <div>
      <CustomerReview />
      <CreateGroupModal/>
      <h1>Home Page</h1>
    </div>
  );
}
