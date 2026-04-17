import { redirect } from "next/navigation";

/** 예전 주소 호환: `/records` → `/performance` */
export default function RecordsRedirectPage() {
  redirect("/performance");
}
