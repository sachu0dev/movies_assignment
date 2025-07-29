import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyListSection } from "@/components/MyListSection";
import { CommunitySection } from "@/components/CommunitySection";

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("my-list");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Favorite Movies & TV Shows
          </h1>
          <p className="text-muted-foreground">
            Manage your personal collection and discover community favorites
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-list">My List</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="my-list" className="space-y-4">
          <MyListSection />
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <CommunitySection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
