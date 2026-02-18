"use client"
import React from 'react';
import {  signIn  } from "next-auth/react";

const LoginButton = () => {
    return (
      <button
        className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-[#101f22] bg-primary hover:bg-primary/90 transition-all duration-200 shadow-[0_0_20px_rgba(19,200,236,0.3)] hover:shadow-[0_0_25px_rgba(19,200,236,0.5)]"
        onClick={() => signIn()}>
      
        Log In
      </button>
    );
};

export default LoginButton;