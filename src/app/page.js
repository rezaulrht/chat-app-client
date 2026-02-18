import React from "react";
import CustomerReview from "./about/review/page";
import Banner from "./about/banner/page";
import CreateGroupModal from "@/components/CreateGroupModal";
import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  return (
    <div>
      <CustomerReview />
      <CreateGroupModal/>
      <h1>Home Page</h1>
    </div>
  );
}
