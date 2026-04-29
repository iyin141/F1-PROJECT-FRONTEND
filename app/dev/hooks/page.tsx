import { redirect } from "next/navigation";
import { Playground } from "./_components/Playground";

export default function HooksDevPage() {
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }
  return <Playground />;
}
