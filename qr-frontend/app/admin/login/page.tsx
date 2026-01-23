import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
