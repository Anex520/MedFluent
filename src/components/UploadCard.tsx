import { useCallback, useRef, useState } from 'react';
import {
  Camera,
  FileText,
  Image as ImageIcon,
  Loader2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

type Mode = 'idle' | 'text';

interface UploadCardProps {
  onAnalyze: (text: string) => void;
  onAnalyzeImage: (image: string) => void;
  analyzing: boolean;
}

const MAX_IMAGE_DIMENSION = 1800;
const IMAGE_QUALITY = 0.82;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export function UploadCard({
  onAnalyze,
  onAnalyzeImage,
  analyzing,
}: UploadCardProps) {
  const toast = useToast();

  const [mode, setMode] = useState<Mode>('idle');
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode('idle');
    setText('');
    setImagePreview(null);
    setSelectedImage(null);
    setProcessingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => {
        reject(new Error('Could not read the selected image.'));
      };

      reader.onload = () => {
        const source = reader.result;

        if (typeof source !== 'string') {
          reject(new Error('Could not read the selected image.'));
          return;
        }

        const img = new Image();

        img.onerror = () => {
          reject(new Error('The selected file is not a valid image.'));
        };

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (
            width > MAX_IMAGE_DIMENSION ||
            height > MAX_IMAGE_DIMENSION
          ) {
            const scale = Math.min(
              MAX_IMAGE_DIMENSION / width,
              MAX_IMAGE_DIMENSION / height
            );

            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext('2d');

          if (!context) {
            reject(new Error('Your browser could not process the image.'));
            return;
          }

          context.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL(
            'image/jpeg',
            IMAGE_QUALITY
          );

          if (compressed.length > MAX_IMAGE_SIZE) {
            const smaller = canvas.toDataURL('image/jpeg', 0.65);

            if (smaller.length > MAX_IMAGE_SIZE) {
              reject(
                new Error(
                  'This image is still too large. Please take a clearer photo from a little farther away.'
                )
              );
              return;
            }

            resolve(smaller);
            return;
          }

          resolve(compressed);
        };

        img.src = source;
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast(
          'Please select an image of your medical report.',
          'error'
        );
        return;
      }

      setProcessingImage(true);

      try {
        const compressed = await compressImage(file);

        setSelectedImage(compressed);
        setImagePreview(compressed);
        setMode('idle');

        toast(
          'Image ready. Check that the report is clear before analyzing.',
          'success'
        );
      } catch (e) {
        toast(
          e instanceof Error
            ? e.message
            : 'Could not process the image.',
          'error'
        );
      } finally {
        setProcessingImage(false);
      }
    },
    [toast]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleImage(file);
    }
  };

  const handleAnalyzeImage = () => {
    if (!selectedImage) {
      toast('Please select an image first.', 'error');
      return;
    }

    onAnalyzeImage(selectedImage);
  };

  const handleSubmitText = () => {
    const finalText = text.trim();

    if (!finalText) {
      toast('Please enter some text to analyze.', 'error');
      return;
    }

    if (finalText.length < 20) {
      toast(
        'Please enter at least a few sentences for a meaningful analysis.',
        'error'
      );
      return;
    }

    onAnalyze(finalText);
  };

  return (
    <div className="card p-5 sm:p-6">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => setMode('idle')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'idle'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Image
        </button>

        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'text'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Type className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {mode === 'idle' && (
        <>
          {!imagePreview && !processingImage && (
            <div className="space-y-4">
              {/* Drag and drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                    : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  Upload your medical report
                </h3>

                <p className="text-sm text-slate-500 mb-4">
                  Use a clear photo or image of your report
                </p>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Choose Image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      handleImage(file);
                    }
                  }}
                />
              </div>

              {/* Camera button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-slate-700 font-medium px-4 py-3 rounded-xl transition"
              >
                <Camera className="w-5 h-5" />
                Take a photo of your report
              </button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    handleImage(file);
                  }
                }}
              />

              <p className="text-xs text-center text-slate-400">
                Make sure the entire report is visible, well-lit, and
                readable.
              </p>
            </div>
          )}

          {processingImage && (
            <div className="border-2 border-dashed rounded-2xl p-10 text-center">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />

              <p className="text-sm font-medium text-slate-700">
                Preparing your image…
              </p>

              <p className="text-xs text-slate-400 mt-1">
                The image is being compressed on your device.
              </p>
            </div>
          )}

          {imagePreview && !processingImage && (
            <div className="animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={imagePreview}
                  alt="Medical report preview"
                  className="w-full max-h-[500px] object-contain"
                />

                <button
                  type="button"
                  onClick={reset}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-red-600 transition"
                  aria-label="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-3">
                <p className="text-xs text-blue-700">
                  <strong>Image analysis:</strong> If image analysis fails, please use the
<strong> Paste Text</strong> option and paste the contents
of your medical report instead.
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={analyzing}
                  className="btn-primary flex-1"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}

                  {analyzing
                    ? 'Analyzing…'
                    : 'Analyze Report Image'}
                </button>

                <button
                  type="button"
                  onClick={reset}
                  disabled={analyzing}
                  className="btn-ghost"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'text' && (
        <div className="animate-fade-in">
          <label className="label">
            Paste your medical report text
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste the text of your medical report here. For example: lab results, discharge summaries, radiology reports, etc."
            className="input resize-y font-mono text-xs leading-relaxed"
          />

          <p className="text-xs text-slate-400 mt-1.5">
            {text.length} characters
          </p>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleSubmitText}
              disabled={analyzing}
              className="btn-primary flex-1"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}

              {analyzing
                ? 'Analyzing…'
                : 'Analyze Report'}
            </button>

            <button
              type="button"
              onClick={reset}
              disabled={analyzing}
              className="btn-ghost"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}