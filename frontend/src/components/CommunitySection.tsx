import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  ThumbsUp,
  ThumbsDown,
  Film,
  Tv,
  Users,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "@/lib/icons";
import type { Entry } from "@/types/type";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { SearchAndFilter } from "./SearchAndFilter";

const InteractionButtons: React.FC<{ entry: Entry }> = ({ entry }) => {
  const queryClient = useQueryClient();

  const { data: interactionData } = useQuery({
    queryKey: ["entry-interaction", entry.id],
    queryFn: () => entriesAPI.getInteraction(entry.id),
    enabled: true,
  });

  const userAction = interactionData?.data?.data?.action || null;

  const likeMutation = useMutation({
    mutationFn: () => entriesAPI.like(entry.id),
    onSuccess: (response) => {
      const message = response.data.message;
      toast.success(message);
      queryClient.setQueryData(["community-entries"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.map((e: Entry) =>
              e.id === entry.id ? response.data.data : e
            ),
          },
        };
      });
      queryClient.invalidateQueries({
        queryKey: ["entry-interaction", entry.id],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to like entry");
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: () => entriesAPI.dislike(entry.id),
    onSuccess: (response) => {
      const message = response.data.message;
      toast.success(message);
      queryClient.setQueryData(["community-entries"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.map((e: Entry) =>
              e.id === entry.id ? response.data.data : e
            ),
          },
        };
      });
      queryClient.invalidateQueries({
        queryKey: ["entry-interaction", entry.id],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to dislike entry");
    },
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending || dislikeMutation.isPending}
          className={
            userAction === "like" ? "text-black hover:text-gray-800" : ""
          }
        >
          {userAction === "like" ? (
            <ThumbsUpIcon className="h-4 w-4 fill-current" />
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}
        </Button>
        <span className="text-xs font-medium">{entry.likes}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dislikeMutation.mutate()}
          disabled={likeMutation.isPending || dislikeMutation.isPending}
          className={
            userAction === "dislike" ? "text-red-600 hover:text-red-700" : ""
          }
        >
          {userAction === "dislike" ? (
            <ThumbsDownIcon className="h-4 w-4 fill-current" />
          ) : (
            <ThumbsDown className="h-4 w-4" />
          )}
        </Button>
        <span className="text-xs font-medium">{entry.dislikes}</span>
      </div>
    </div>
  );
};

export const CommunitySection: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("likes");
  const [sortOrder, setSortOrder] = useState("desc");
  const limit = 10;

  const {
    data: entriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["community-entries", page, search, type, sortBy, sortOrder],
    queryFn: () =>
      entriesAPI.getCommunity({
        page,
        limit,
        search,
        type,
        sortBy,
        sortOrder,
      }),
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setType(value);
    setPage(1);
  }, []);

  const handleSortByChange = useCallback((value: string) => {
    setSortBy(value);
    setPage(1);
  }, []);

  const handleSortOrderChange = useCallback((value: string) => {
    setSortOrder(value);
    setPage(1);
  }, []);

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

      {/* Search and Filter - Always visible */}
      <SearchAndFilter
        onSearchChange={handleSearchChange}
        onTypeChange={handleTypeChange}
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
        defaultType={type}
        defaultSortBy={sortBy}
        defaultSortOrder={sortOrder}
        showSortOptions={true}
      />

      {isLoading ? (
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
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load community entries. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
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
                      <InteractionButtons entry={entry} />
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
