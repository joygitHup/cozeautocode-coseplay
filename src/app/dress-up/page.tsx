'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getScenicSpotById,
  costumes,
  jewelry,
  headwear,
  makeupStyles,
} from '@/lib/data';
import type { Costume, Jewelry, Headwear, Makeup } from '@/lib/types';

function DressUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const spotId = searchParams.get('spot') || 'forbidden-city';
  const scenicSpot = getScenicSpotById(spotId);

  // 状态管理
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoType, setPhotoType] = useState<'full-body' | 'half-body'>(
    'full-body'
  );
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);
  const [selectedJewelry, setSelectedJewelry] = useState<Jewelry[]>([]);
  const [selectedHeadwear, setSelectedHeadwear] = useState<Headwear | null>(
    null
  );
  const [selectedMakeup, setSelectedMakeup] = useState<Makeup | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');

  // 处理照片上传
  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPhoto(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPhotoPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // 处理首饰选择（可多选）
  const toggleJewelry = (item: Jewelry) => {
    setSelectedJewelry((prev) =>
      prev.find((j) => j.id === item.id)
        ? prev.filter((j) => j.id !== item.id)
        : [...prev, item]
    );
  };

  // 生成图片
  const handleGenerate = async () => {
    if (!photo || !selectedCostume || !selectedHeadwear || !selectedMakeup) {
      alert('请上传照片并选择服饰、头饰和妆容');
      return;
    }

    setIsGenerating(true);
    try {
      // 将照片转换为 base64
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const photoBase64 = ev.target?.result as string;

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoBase64,
            photoType,
            costumeId: selectedCostume.id,
            jewelryIds: selectedJewelry.map((j) => j.id),
            headwearId: selectedHeadwear.id,
            makeupId: selectedMakeup.id,
            scenicSpotId: spotId,
          }),
        });

        const data = await response.json();
        if (data.imageUrl) {
          setGeneratedImage(data.imageUrl);
        } else {
          alert('生成失败：' + (data.error || '未知错误'));
        }
        setIsGenerating(false);
      };
      reader.readAsDataURL(photo);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
      setIsGenerating(false);
    }
  };

  // 保存图片
  const handleSave = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `华裳纪-${scenicSpot?.name || '古装'}-${Date.now()}.png`;
      link.click();
    }
  };

  if (!scenicSpot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-yanhui">景区不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subai">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-daiqing hover:text-xiangse transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>返回首页</span>
          </button>
          <h1 className="font-serif text-xl text-daiqing">{scenicSpot.name}</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Scenic Spot Info */}
      <section className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${scenicSpot.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-daiqing/70 to-transparent" />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <p className="text-yuebai/80 text-sm mb-1">{scenicSpot.province}</p>
            <h2 className="font-serif text-3xl text-white mb-2">
              {scenicSpot.name}
            </h2>
            <p className="text-yuebai/90 text-sm max-w-md">
              {scenicSpot.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Photo Upload & Preview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo Upload */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg text-daiqing mb-4">
                上传照片
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPhotoType('full-body')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      photoType === 'full-body'
                        ? 'bg-daiqing text-white'
                        : 'bg-yuebai/50 text-daiqing hover:bg-yuebai'
                    }`}
                  >
                    全身照
                  </button>
                  <button
                    onClick={() => setPhotoType('half-body')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      photoType === 'half-body'
                        ? 'bg-daiqing text-white'
                        : 'bg-yuebai/50 text-daiqing hover:bg-yuebai'
                    }`}
                  >
                    半身照
                  </button>
                </div>
                <label className="block">
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-xiangse ${
                      photoPreview
                        ? 'border-xiangse bg-xiangse/5'
                        : 'border-yanhui/30'
                    }`}
                  >
                    {photoPreview ? (
                      <div className="relative w-full aspect-[3/4] max-w-[200px] mx-auto">
                        <Image
                          src={photoPreview}
                          alt="预览"
                          fill
                          sizes="(max-width: 200px) 100vw, 200px"
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 mx-auto text-yanhui/50 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-yanhui text-sm">
                          点击上传{photoType === 'full-body' ? '全身' : '半身'}
                          照片
                        </p>
                        <p className="text-yanhui/60 text-xs mt-1">
                          支持 JPG、PNG 格式
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Generated Result */}
            {generatedImage && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-lg text-daiqing mb-4">
                  生成效果
                </h3>
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={generatedImage}
                    alt="生成效果"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-xiangse text-daiqing rounded-xl font-medium hover:bg-xiangse/80 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  保存图片
                </button>
              </div>
            )}
          </div>

          {/* Right: Selection Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Costume Selection */}
            <SelectionPanel
              title="选择服饰"
              items={costumes}
              selectedId={selectedCostume?.id}
              onSelect={(item) => setSelectedCostume(item as Costume)}
            />

            {/* Jewelry Selection */}
            <SelectionPanel
              title="选择首饰（可多选）"
              items={jewelry}
              selectedIds={selectedJewelry.map((j) => j.id)}
              multiSelect
              onSelect={(item) => toggleJewelry(item as Jewelry)}
            />

            {/* Headwear Selection */}
            <SelectionPanel
              title="选择头饰"
              items={headwear}
              selectedId={selectedHeadwear?.id}
              onSelect={(item) => setSelectedHeadwear(item as Headwear)}
            />

            {/* Makeup Selection */}
            <SelectionPanel
              title="选择妆容"
              items={makeupStyles}
              selectedId={selectedMakeup?.id}
              onSelect={(item) => setSelectedMakeup(item as Makeup)}
            />

            {/* Generate Button */}
            <div className="sticky bottom-4">
              <button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !photo ||
                  !selectedCostume ||
                  !selectedHeadwear ||
                  !selectedMakeup
                }
                className="w-full py-4 bg-daiqing text-white rounded-2xl font-serif text-lg shadow-lg hover:bg-daiqing/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    正在生成...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    生成古装效果
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 选择面板组件
interface SelectionPanelProps<T extends { id: string; name: string; image: string; description: string }> {
  title: string;
  items: T[];
  selectedId?: string;
  selectedIds?: string[];
  multiSelect?: boolean;
  onSelect: (item: T) => void;
}

function SelectionPanel<T extends { id: string; name: string; image: string; description: string }>({
  title,
  items,
  selectedId,
  selectedIds,
  multiSelect,
  onSelect,
}: SelectionPanelProps<T>) {
  const isSelected = (id: string) => {
    if (multiSelect && selectedIds) {
      return selectedIds.includes(id);
    }
    return selectedId === id;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-serif text-lg text-daiqing mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`relative group rounded-xl overflow-hidden transition-all ${
              isSelected(item.id)
                ? 'ring-2 ring-xiangse ring-offset-2'
                : 'hover:ring-2 hover:ring-daiqing/30 hover:ring-offset-1'
            }`}
          >
            <div className="aspect-square relative">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-daiqing/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-2">
              <p className="text-sm text-daiqing font-medium truncate">
                {item.name}
              </p>
              <p className="text-xs text-yanhui truncate">{item.description}</p>
            </div>
            {isSelected(item.id) && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-xiangse rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DressUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-yanhui">加载中...</p>
        </div>
      }
    >
      <DressUpContent />
    </Suspense>
  );
}
