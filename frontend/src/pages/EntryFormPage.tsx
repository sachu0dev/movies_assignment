import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entriesAPI, uploadAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CreateEntryForm } from "../types/type";

const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Movie", "TV"]),
  director: z.string().min(1, "Director is required"),
  budget: z.string().min(1, "Budget is required"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  yearTime: z.string().min(1, "Year/Time is required"),
});

type EntryForm = z.infer<typeof entrySchema>;

export const EntryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch entry data if editing
  const { data: entryData, isLoading: isLoadingEntry } = useQuery({
    queryKey: ["entry", id],
    queryFn: () => entriesAPI.getById(Number(id)),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      type: "Movie",
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (entryData?.data?.data) {
      const entry = entryData.data.data;
      setValue("title", entry.title);
      setValue("type", entry.type as "Movie" | "TV");
      setValue("director", entry.director);
      setValue("budget", entry.budget);
      setValue("location", entry.location);
      setValue("duration", entry.duration);
      setValue("yearTime", entry.yearTime);
      if (entry.imageUrl) {
        setImagePreview(entry.imageUrl);
      }
    }
  }, [entryData, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateEntryForm) => entriesAPI.create(data),
    onSuccess: () => {
      toast.success("Entry created successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-entries"] });
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create entry");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateEntryForm>;
    }) => entriesAPI.update(id, data),
    onSuccess: () => {
      toast.success("Entry updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-entries"] });
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update entry");
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadAPI.upload(file);
      return response.data.data.url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const onSubmit = async (data: EntryForm) => {
    let imageUrl = imagePreview;

    // Upload new image if selected
    if (imageFile) {
      const uploadedUrl = await handleImageUpload(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        return;
      }
    }

    const entryData = {
      ...data,
      imageUrl: imageUrl || undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ id: Number(id), data: entryData });
    } else {
      createMutation.mutate(entryData);
    }
  };

  if (isLoadingEntry) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Entry" : "Add New Entry"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update your movie or TV show entry"
              : "Add a new movie or TV show to your collection"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entry Details</CardTitle>
          <CardDescription>
            Fill in the details for your movie or TV show entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter the title"
                  {...register("title")}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{errors.title.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(value) =>
                    setValue("type", value as "Movie" | "TV")
                  }
                >
                  <SelectTrigger
                    className={errors.type ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Movie">Movie</SelectItem>
                    <SelectItem value="TV">TV Show</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{errors.type.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="director">Director *</Label>
                <Input
                  id="director"
                  placeholder="Enter the director"
                  {...register("director")}
                  className={errors.director ? "border-red-500" : ""}
                />
                {errors.director && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {errors.director.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget *</Label>
                <Input
                  id="budget"
                  placeholder="Enter the budget"
                  {...register("budget")}
                  className={errors.budget ? "border-red-500" : ""}
                />
                {errors.budget && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{errors.budget.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Enter the location"
                  {...register("location")}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {errors.location.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 120 minutes or 5 seasons"
                  {...register("duration")}
                  className={errors.duration ? "border-red-500" : ""}
                />
                {errors.duration && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {errors.duration.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearTime">Year/Time Period *</Label>
                <Input
                  id="yearTime"
                  placeholder="e.g., 2023 or 2019-2023"
                  {...register("yearTime")}
                  className={errors.yearTime ? "border-red-500" : ""}
                />
                {errors.yearTime && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {errors.yearTime.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Poster Image</Label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-32 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-32 h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-2">
                        No image
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  isUploading
                }
                className="flex-1"
              >
                {createMutation.isPending ||
                updateMutation.isPending ||
                isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading
                      ? "Uploading..."
                      : isEditing
                      ? "Updating..."
                      : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Entry"
                ) : (
                  "Create Entry"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
