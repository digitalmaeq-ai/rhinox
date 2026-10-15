import { redirect } from "next/navigation";

// There is one experience library: the Experiences page in the Explore
// menu (app/explore/experiences). This older, plainer list is kept only as
// a redirect so existing links to /experiences still land on it.
export default function ExperiencesPage() {
  redirect("/explore/experiences");
}
