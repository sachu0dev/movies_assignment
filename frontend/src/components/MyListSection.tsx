import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
import { Plus, Edit, Trash2, Share2, Film, Tv } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Entry } from "../types/type";

export const MyListSection: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: entriesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-entries", page],
    queryFn: () => entriesAPI.getMy({ page, limit }),
  });

  const handleRelease = async (entryId: number) => {
    try {
      await entriesAPI.release(entryId);
      toast.success("Entry released to community!");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to release entry");
    }
  };

  const handleDelete = async (entryId: number) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await entriesAPI.delete(entryId);
        toast.success("Entry deleted successfully!");
        refetch();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to delete entry");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
            Failed to load your entries. Please try again.
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
        <h2 className="text-2xl font-semibold">My Collection</h2>
        <Link to="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </Link>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Film className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No entries yet</h3>
              <p className="mt-2 text-muted-foreground">
                Start building your collection by adding your favorite movies
                and TV shows.
              </p>
              <Link to="/create">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Entry
                </Button>
              </Link>
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

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Added {formatDate(entry.createdAt)}
                    </div>
                    <div className="flex gap-1">
                      <Link to={`/edit/${entry.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {!entry.isReleased && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRelease(entry.id)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
