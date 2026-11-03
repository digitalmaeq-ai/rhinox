import HomeStatement from "./components/home/HomeStatement";
import PlayRhinox from "./components/home/PlayRhinox";
import PlayLabs from "./components/home/PlayLabs";
import CodeStudioBand from "./components/home/CodeStudioBand";
import ExploreRhinox from "./components/home/ExploreRhinox";
import ShopRhinox from "./components/home/ShopRhinox";
import SchoolsRhinox from "./components/home/SchoolsRhinox";
import MoreRhinox from "./components/home/MoreRhinox";
import "./home-polish.css";

export default function Home() {
  return (
    <main>
      <HomeStatement />

      <PlayRhinox />

      <PlayLabs />

      <CodeStudioBand />

      <ExploreRhinox />

      <ShopRhinox />

      <SchoolsRhinox />

      <MoreRhinox />
    </main>
  );
}
