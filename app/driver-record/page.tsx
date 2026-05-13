import { redirect } from "next/navigation";

export default function DriverRecordPage() {
  redirect(`/drivers/VER/${new Date().getFullYear()}`);
}
