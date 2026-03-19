"use client";

import dynamic from "next/dynamic";
import IncomingCallNotification from "./IncomingCallNotification";
import FloatingCallBar from "./FloatingCallBar";

const CallModal = dynamic(() => import("./CallModal"), { ssr: false });

export default function CallOverlays() {
  return (
    <>
      <IncomingCallNotification />
      <CallModal />
      <FloatingCallBar />
    </>
  );
}
