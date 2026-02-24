/**
 * ImageCropper Component - PLACEHOLDER
 * 
 * Questo è un placeholder per il componente di ritaglio immagini.
 * Attualmente non implementato nel progetto.
 * 
 * Per future implementazioni, considerare l'uso di:
 * - react-easy-crop
 * - react-image-crop
 * - easy-crop-react
 * 
 * @author Gino Pandozzi-Trani
 * @version 0.1.0 (stub)
 */

import React from 'react';

interface ImageCropperProps {
  image: string;
  onCropComplete?: (croppedImage: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete }) => {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-yellow-800 font-semibold mb-2">Image Cropper - Coming Soon</h3>
      <p className="text-yellow-700 text-sm">
        Il componente di ritaglio immagini sarà implementato nella prossima versione.
      </p>
      {image && (
        <div className="mt-4">
          <img 
            src={image} 
            alt="Preview" 
            className="max-w-xs max-h-64 rounded-md border border-yellow-300"
          />
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
