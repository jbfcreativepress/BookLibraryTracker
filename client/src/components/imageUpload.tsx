import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  previewUrl?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  previewUrl,
  disabled = false,
  isLoading = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        disabled ? "border-gray-200 bg-gray-50" : "border-primary/20 hover:border-primary/40"
      }`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isLoading}
      />
      
      {previewUrl ? (
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src={previewUrl}
              alt="Book cover preview" 
              className="max-h-48 mx-auto object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-6 w-6 rounded-full bg-destructive text-white"
              onClick={(e) => {
                e.stopPropagation();
                onImageRemove();
              }}
              disabled={disabled || isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-8">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Upload book cover image
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF (max. 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
