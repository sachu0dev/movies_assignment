import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { entriesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, Film, Tv, Users } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Entry } from "../types/type";

export const CommunitySection: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: entriesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["community-entries", page],
    queryFn: () => entriesAPI.getCommunity({ page, limit }),
  });

  const handleLike = async (entryId: number) => {
    try {
      await entriesAPI.like(entryId);
      toast.success("Entry liked!");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to like entry");
    }
  };

  const handleDislike = async (entryId: number) => {
    try {
      await entriesAPI.dislike(entryId);
      toast.success("Entry disliked!");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to dislike entry");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Failed to load community entries. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const entries = entriesData?.data?.data || [];
  const pagination = entriesData?.data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Community Favorites</h2>
        </div>
        <Badge variant="outline">{pagination?.total || 0} entries</Badge>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No community entries yet
              </h3>
              <p className="mt-2 text-muted-foreground">
                Be the first to share your favorite movies and TV shows with the
                community!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry: Entry) => (
              <Card key={entry.id} className="overflow-hidden">
                {entry.imageUrl && (
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={entry.imageUrl}
                      alt={entry.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">
                        {entry.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        by {entry.director}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={entry.type === "Movie" ? "default" : "secondary"}
                    >
                      {entry.type === "Movie" ? (
                        <Film className="mr-1 h-3 w-3" />
                      ) : (
                        <Tv className="mr-1 h-3 w-3" />
                      )}
                      {entry.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Duration: {entry.duration}</div>
                    <div>Year: {entry.yearTime}</div>
                    <div>Budget: {entry.budget}</div>
                    <div>Location: {entry.location}</div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(entry.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        Shared by {entry.user.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(entry.id)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <span className="text-xs font-medium">
                            {entry.likes}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDislike(entry.id)}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <span className="text-xs font-medium">
                            {entry.dislikes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
