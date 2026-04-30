import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Camera, ImagePlus, X, ArrowRight, Loader2 } from 'lucide-react';

const MAX_IMAGES = 10;

export default function UploadPage() {
  const navigate = useNavigate();
  const { analyzeImages } = useApp();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      showToast(`最多上传${MAX_IMAGES}张照片`, 'error');
      return;
    }

    const newFiles = Array.from(files).slice(0, remaining);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImages(prev => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, result];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images.length, showToast]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      showToast('请先上传至少1张景点照片', 'error');
      return;
    }

    setAnalyzing(true);
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 1500));
    analyzeImages(images);
    setAnalyzing(false);
    showToast('AI识别完成!', 'success');
    navigate('/adjust');
  };

  return (
    <div className="min-h-screen bg-parchment safe-top safe-bottom">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <button
          className="text-muted-foreground text-sm touch-target mb-2"
          onClick={() => navigate('/')}
        >
          ← 返回
        </button>
        <h1 className="text-2xl font-hand text-foreground">上传景点照片</h1>
        <p className="text-muted-foreground text-sm mt-1">
          拍摄或选择 1-{MAX_IMAGES} 张你计划去的景点照片
        </p>
      </div>

      {/* Upload Area */}
      <div className="px-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Image Grid */}
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden border-doodle animate-pop-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <img
                src={img}
                alt={`景点 ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center touch-target"
                onClick={() => removeImage(i)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-foreground/40 text-background text-xs text-center py-0.5">
                {i + 1}
              </div>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <button
              className="aspect-square rounded-lg border-2 border-dashed border-adventure-orange/40 flex flex-col items-center justify-center gap-1 text-adventure-orange touch-target hover:border-adventure-orange/70 hover:bg-adventure-orange/5 transition-all active:scale-95"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">添加</span>
            </button>
          )}
        </div>

        {/* Camera shortcut */}
        {images.length < MAX_IMAGES && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'environment';
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files?.[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string;
                      setImages(prev => prev.length < MAX_IMAGES ? [...prev, result] : prev);
                    };
                    reader.readAsDataURL(target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <Camera className="mr-2 h-4 w-4" />
              拍照添加
            </Button>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            已选择 <span className="font-medium text-foreground">{images.length}</span>/{MAX_IMAGES}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_IMAGES }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < images.length ? 'bg-adventure-orange' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/80 backdrop-blur-sm safe-bottom">
        <Button
          size="xl"
          className="w-full"
          disabled={images.length === 0 || analyzing}
          onClick={handleAnalyze}
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              AI 正在识别景点...
            </>
          ) : (
            <>
              开始AI识别
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
