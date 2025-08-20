import { Header } from "@/components/Header";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ActivityGrid } from "@/components/ActivityGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <Header />
      <WelcomeBanner />
      <SearchFilterBar />
      <ActivityGrid />
    </div>
  );
};

export default Index;
