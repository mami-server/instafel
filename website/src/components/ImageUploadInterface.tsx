"use client";

import type React from "react";

import { useState, useCallback, useEffect } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

interface ImageUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  onFileAdd?: (file: UploadedFile) => void;
  onFileRemove?: (fileId: string, file: UploadedFile) => void;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  initialFiles?: UploadedFile[];
  disabled?: boolean;
}

export default function ImageUploadInterface({
  onFilesChange,
  onFileAdd,
  onFileRemove,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"],
  initialFiles = [],
  disabled = false,
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Unsupported file type: ${file.type}`;
    }
    if (file.size > maxFileSize) {
      return `File size too large: ${formatFileSize(
        file.size
      )} (Max: ${formatFileSize(maxFileSize)})`;
    }
    return null;
  };

  const processFiles = useCallback(
    (fileList: FileList) => {
      if (disabled) return;

      setError("");
      const newFiles: File[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const validationError = validateFile(file);

        if (validationError) {
          setError(validationError);
          return;
        }

        if (files.length + newFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files can be uploaded`);
          break;
        }

        newFiles.push(file);
      }

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const id = Math.random().toString(36).substr(2, 9);
          const newFile: UploadedFile = {
            id,
            file,
            preview: e.target?.result as string,
            name: `${id}.${file.type.split("/")[1].trim()}`,
            size: file.size,
            type: file.type,
          };

          setFiles((prev) => {
            const updated = [...prev, newFile];
            return updated;
          });

          onFileAdd?.(newFile);
        };
        reader.readAsDataURL(file);
      });
    },
    [files.length, maxFiles, maxFileSize, acceptedTypes, disabled, onFileAdd]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
      e.target.value = "";
    },
    [processFiles, disabled]
  );

  const removeFile = useCallback(
    (id: string) => {
      if (disabled) return;

      setFiles((prev) => {
        const fileToRemove = prev.find((f) => f.id === id);
        const updated = prev.filter((file) => file.id !== id);

        if (fileToRemove) {
          onFileRemove?.(id, fileToRemove);
        }

        return updated;
      });
      setError("");
    },
    [disabled, onFileRemove]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const clearAllFiles = () => {
    if (disabled) return;

    const filesToRemove = [...files];
    setFiles([]);
    setError("");

    filesToRemove.forEach((file) => {
      onFileRemove?.(file.id, file);
    });
  };

  const canAddMoreFiles = files.length < maxFiles;

  return (
    <div className="w-full mx-auto pb-4 space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      )}

      {canAddMoreFiles && (
        <Card className={"border-dashed border-2"}>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Select files to upload</p>
            </div>

            <input
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />

            {canAddMoreFiles && (
              <Button asChild className="mt-4 mb-4" variant={"default"}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select Files
                </label>
              </Button>
            )}

            <p className="text-xs text-center text-muted-foreground mt-2">
              Only{" "}
              {acceptedTypes
                .map((type) => type.split("/")[1].toUpperCase())
                .join(", ")}{" "}
              formats supported
            </p>
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Selected Images ({files.length}/5)
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFiles}
              className="bg-transparent items-center"
              disabled={disabled}
            >
              <X className="mr-1 h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeFile(file.id)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <p
                      className="font-medium text-sm truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} •{" "}
                      {file.type.split("/")[1].toUpperCase()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
