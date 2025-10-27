// components/ImageManager.tsx
import React, { useState, useRef } from 'react';
import { ImageData } from '@/services/produits-service';

interface ImageManagerProps {
  images: File[];
  existingImages?: ImageData[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

interface ImageWithRang {
  file?: File;
  existing?: ImageData;
  rang: number;
  preview?: string;
  id: string;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  existingImages = [],
  onImagesChange,
  maxImages = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageList, setImageList] = useState<ImageWithRang[]>(() => {
    // Initialiser avec les images existantes
    const existing = existingImages.map((img, index) => ({
      existing: img,
      rang: img.rang,
      id: `existing-${img.idImage || index}`,
    }));
    
    // Ajouter les nouvelles images
    const newImages = images.map((file, index) => ({
      file,
      rang: existing.length + index + 1,
      preview: URL.createObjectURL(file),
      id: `new-${Date.now()}-${index}`,
    }));
    
    return [...existing, ...newImages];
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newImages = files.map((file, index) => {
      const maxRang = Math.max(...imageList.map(img => img.rang), 0);
      return {
        file,
        rang: maxRang + index + 1,
        preview: URL.createObjectURL(file),
        id: `new-${Date.now()}-${index}`,
      };
    });

    const updatedList = [...imageList, ...newImages];
    if (updatedList.length > maxImages) {
      updatedList.splice(maxImages);
    }

    setImageList(updatedList);
    updateParentImages(updatedList);
  };

  const updateParentImages = (list: ImageWithRang[]) => {
    const newFiles = list
      .filter(item => item.file)
      .sort((a, b) => a.rang - b.rang)
      .map(item => item.file!);
    onImagesChange(newFiles);
  };

  const removeImage = (id: string) => {
    const updatedList = imageList.filter(img => img.id !== id);
    // Réorganiser les rangs
    const reorderedList = updatedList.map((img, index) => ({
      ...img,
      rang: index + 1,
    }));
    setImageList(reorderedList);
    updateParentImages(reorderedList);
  };

  const updateRang = (id: string, newRang: number) => {
    if (newRang < 1 || newRang > imageList.length) return;

    const updatedList = imageList.map(img => {
      if (img.id === id) {
        return { ...img, rang: newRang };
      }
      return img;
    });

    // Réorganiser les rangs pour éviter les doublons
    updatedList.sort((a, b) => a.rang - b.rang);
    const reorderedList = updatedList.map((img, index) => ({
      ...img,
      rang: index + 1,
    }));

    setImageList(reorderedList);
    updateParentImages(reorderedList);
  };

  const getImageSrc = (image: ImageWithRang) => {
    if (image.preview) return image.preview;
    if (image.existing) return `${image.existing.url}`;
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Images du produit ({imageList.length}/{maxImages})
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={imageList.length >= maxImages}
          className="btn btn-sm btn-outline btn-primary"
        >
          Ajouter des images
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {imageList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imageList
            .sort((a, b) => a.rang - b.rang)
            .map((image) => (
              <div
                key={image.id}
                className="relative border rounded-lg p-2 bg-white shadow-sm"
              >
                <div className="aspect-square relative mb-2">
                  <img
                    src={getImageSrc(image)}
                    alt={`Image ${image.rang}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Rang:</label>
                  <input
                    type="number"
                    min="1"
                    max={imageList.length}
                    value={image.rang}
                    onChange={(e) => updateRang(image.id, parseInt(e.target.value))}
                    className="input input-xs input-bordered w-16"
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      {imageList.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2">Aucune image sélectionnée</p>
            <p className="text-sm text-gray-400">Cliquez sur "Ajouter des images" pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;