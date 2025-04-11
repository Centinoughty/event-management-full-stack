import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard"); // Automatically redirects
  return null; // Ensures nothing is rendered before redirect
}
