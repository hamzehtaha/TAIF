"use client";

import { useState, useEffect } from "react";
import { Video, Search, Eye, Play, Trash2, Edit, Calendar, LayoutGrid, List } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateVideoDialog } from "@/components/admin/content/CreateVideoDialog";
import { EditVideoDialog } from "@/components/admin/content/EditVideoDialog";
import { contentService, Content, VideoContent, LessonItemType } from "@/services/content.service";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function VideosPage() {
  const [videos, setVideos] = useState<Content[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<Content | null>(null);
  const [editVideoData, setEditVideoData] = useState<VideoContent | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery]);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const allContent = await contentService.getAllContent();
      const videoContent = allContent.filter(c => c.type === LessonItemType.Video);
      setVideos(videoContent);
    } catch (error) {
      console.error("Failed to load videos:", error);
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await contentService.deleteContent(deleteId);
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      setDeleteId(null);
      loadVideos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const filterVideos = () => {
    let result = [...videos];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(video => {
        const videoData = contentService.parseContentData(video) as VideoContent;
        return videoData.title?.toLowerCase().includes(query) || videoData.url.toLowerCase().includes(query);
      });
    }
    setFilteredVideos(result);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Videos" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Videos</h1>
            <p className="text-muted-foreground">
              View all video content across your courses ({filteredVideos.length} videos)
            </p>
          </div>
          <CreateVideoDialog onSuccess={loadVideos} />
        </div>

        {/* Search and View Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos by title or URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Videos Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? "No videos match your search."
                  : "No video content found. Create your first video to get started."}
              </p>
              <CreateVideoDialog onSuccess={loadVideos} />
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => {
              const videoData = contentService.parseContentData(video) as VideoContent;
              return (
                <Card key={video.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-blue-600/20 relative flex items-center justify-center">
                    {videoData.thumbnailUrl ? (
                      <img src={videoData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="h-6 w-6 text-blue-500 ml-1" />
                      </div>
                    )}
                    {videoData.durationInSeconds > 0 && (
                      <Badge className="absolute bottom-2 right-2 bg-black/70">
                        {formatDuration(videoData.durationInSeconds)}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate" title={videoData.title || videoData.url}>
                      {videoData.title || 'Untitled Video'}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-1" title={videoData.url}>
                      {videoData.url}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {formatDate(video.createdAt)}</span>
                    </div>
                    {video.updatedAt && video.updatedAt !== video.createdAt && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Updated: {formatDate(video.updatedAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <Badge variant="outline">Video</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={videoData.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditContent(video);
                            setEditVideoData(videoData);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteId(video.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => {
              const videoData = contentService.parseContentData(video) as VideoContent;
              return (
                <Card key={video.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {videoData.thumbnailUrl ? (
                          <img src={videoData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Play className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{videoData.title || 'Untitled Video'}</h3>
                        <p className="text-xs text-muted-foreground truncate">{videoData.url}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {videoData.durationInSeconds > 0 && (
                            <span>{formatDuration(videoData.durationInSeconds)}</span>
                          )}
                          <span>Created: {formatDate(video.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={videoData.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditContent(video);
                            setEditVideoData(videoData);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteId(video.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Video Dialog */}
      <EditVideoDialog
        content={editContent}
        videoData={editVideoData}
        open={!!editContent}
        onOpenChange={(open) => {
          if (!open) {
            setEditContent(null);
            setEditVideoData(null);
          }
        }}
        onSuccess={loadVideos}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
