import React from "react";
import CustomerReview from "./about/review/page";
import Banner from "./about/banner/page";

export default function HomePage() {
  return (
    <div>
      <Banner/>
      <CustomerReview />
      <h1>Home Page</h1>
    </div>
  );
}
