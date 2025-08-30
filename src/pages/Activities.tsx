import { useState } from "react";
import { Header } from "@/components/Header";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ActivityGrid } from "@/components/ActivityGrid";

const Activities = () => {
  const [searchFilters, setSearchFilters] = useState({});

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <Header />
      <WelcomeBanner />
      <SearchFilterBar onFiltersChange={setSearchFilters} />
      <ActivityGrid searchFilters={searchFilters} />
    </div>
  );
};

export default Activities;