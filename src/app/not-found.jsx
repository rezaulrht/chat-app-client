import dynamic from "next/dynamic";

const NotFoundContent = dynamic(
  () => import("@/components/shared/NotFoundContent")
);

export default function NotFound() {
  return <NotFoundContent />;
}
