import { redirect } from "next/navigation";

// Back-compat: the community index used to be email-marketerz only.
export default function CommunityIndex() {
  redirect("/community/email-marketerz");
}
