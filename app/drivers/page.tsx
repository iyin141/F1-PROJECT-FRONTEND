import { redirect } from "next/navigation";

export default function DriversIndexPage() {
  redirect(`/drivers/year/${new Date().getFullYear()}`);
}
