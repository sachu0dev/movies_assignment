import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "@/lib/icons";
import { useEffect, useMemo, useState } from "react";

interface SearchAndFilterProps {
  onSearchChange: (search: string) => void;
  onTypeChange: (type: string) => void;
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (sortOrder: string) => void;
  defaultType?: string;
  defaultSortBy?: string;
  defaultSortOrder?: string;
  showTypeFilter?: boolean;
  showSortOptions?: boolean;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearchChange,
  onTypeChange,
  onSortByChange,
  onSortOrderChange,
  defaultType = "all",
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
  showTypeFilter = true,
  showSortOptions = true,
}) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState(defaultType);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    };
  }, [onSearchChange]);

  useEffect(() => {
    if (search !== "") {
      debouncedSearch(search);
    } else {
      onSearchChange(search);
    }
  }, [search, debouncedSearch, onSearchChange]);

  const handleTypeChange = (value: string) => {
    setType(value);
    onTypeChange(value);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    onSortByChange(value);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    onSortOrderChange(value);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by title, director, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {showTypeFilter && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Movie">Movie</SelectItem>
                <SelectItem value="TV">TV Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showSortOptions && (
          <>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="yearTime">Year</SelectItem>
                {defaultSortBy === "likes" && (
                  <SelectItem value="likes">Likes</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
};
