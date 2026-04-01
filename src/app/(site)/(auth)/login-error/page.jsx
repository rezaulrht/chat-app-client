import dynamic from "next/dynamic";

const LoginErrorContent = dynamic(
  () => import("@/components/auth/LoginErrorContent")
);

export default function LoginErrorPage() {
  return <LoginErrorContent />;
}
