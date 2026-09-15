'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getScenicSpotById,
  costumes,
  jewelry,
  headwear,
  makeupStyles,
} from '@/lib/data';
import {
  useCustomCostumes,
  useCustomJewelry,
  useCustomHeadwear,
  useCustomMakeup,
  useMergedData,
} from '@/hooks/use-custom-data';
import {
  useI18n,
  localizeScenicSpot,
  localizeCostumes,
  localizeJewelryList,
  localizeHeadwearList,
  localizeMakeupList,
} from '@/lib/i18n';
import { useWallet } from '@/hooks/use-wallet';
import { CreditsPaywall } from '@/components/billing/credits-paywall';
import { getDeviceFingerprint } from '@/lib/client/device-fingerprint';
import {
  buildScenicShareUrl,
  watermarkImage,
} from '@/lib/client/watermark';
import type { Costume, Jewelry, Headwear, Makeup } from '@/lib/types';

const PENDING_GENERATE_KEY = 'huashangji_pending_generate';

type PendingGenerate = {
  spotId: string;
  photoBase64: string;
  photoType: 'full-body' | 'half-body';
  costumeId: string;
  jewelryIds: string[];
  headwearId: string;
  makeupId: string;
};

type DressUpContentProps = {
  spotId: string;
};

export function DressUpContent({ spotId }: DressUpContentProps) {
  const router = useRouter();
  const { locale, t, format } = useI18n();
  const { wallet, refresh: refreshWallet } = useWallet();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const rawSpot = getScenicSpotById(spotId);
  const scenicSpot = rawSpot ? localizeScenicSpot(rawSpot, locale) : undefined;

  const { customCostumes, isLoaded: costumesLoaded } = useCustomCostumes();
  const { customJewelry, isLoaded: jewelryLoaded } = useCustomJewelry();
  const { customHeadwear, isLoaded: headwearLoaded } = useCustomHeadwear();
  const { customMakeup, isLoaded: makeupLoaded } = useCustomMakeup();

  const allCostumes = localizeCostumes(
    useMergedData(costumes, customCostumes, costumesLoaded),
    locale,
  );
  const allJewelry = localizeJewelryList(
    useMergedData(jewelry, customJewelry, jewelryLoaded),
    locale,
  );
  const allHeadwear = localizeHeadwearList(
    useMergedData(headwear, customHeadwear, headwearLoaded),
    locale,
  );
  const allMakeup = localizeMakeupList(
    useMergedData(makeupStyles, customMakeup, makeupLoaded),
    locale,
  );

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoType, setPhotoType] = useState<'full-body' | 'half-body'>(
    'full-body',
  );
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);
  const [selectedJewelry, setSelectedJewelry] = useState<Jewelry[]>([]);
  const [selectedHeadwear, setSelectedHeadwear] = useState<Headwear | null>(
    null,
  );
  const [selectedMakeup, setSelectedMakeup] = useState<Makeup | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [shareHint, setShareHint] = useState<string | null>(null);

  const runGenerateRequest = useCallback(
    async (payload: PendingGenerate) => {
      setIsGenerating(true);
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'x-device-fp': getDeviceFingerprint(),
          },
          body: JSON.stringify({
            ...payload,
            deviceFingerprint: getDeviceFingerprint(),
          }),
        });

        const data = await response.json();
        if (response.status === 402 || data.code === 'NEED_CREDITS') {
          sessionStorage.setItem(PENDING_GENERATE_KEY, JSON.stringify(payload));
          setPaywallOpen(true);
          alert(t.billing.needCredits);
          await refreshWallet();
          return false;
        }
        if (response.status === 429) {
          alert(data.error || t.dressUp.alertRetry);
          return false;
        }
        if (data.imageUrl) {
          sessionStorage.removeItem(PENDING_GENERATE_KEY);
          setGeneratedImage(data.imageUrl);
          await refreshWallet();
          return true;
        }
        alert(t.dressUp.alertFailed + (data.error || t.dressUp.unknownError));
        await refreshWallet();
        return false;
      } catch (error) {
        console.error('生成失败:', error);
        alert(t.dressUp.alertRetry);
        return false;
      } finally {
        setIsGenerating(false);
      }
    },
    [refreshWallet, t],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get('paid') === '1';
    if (!paid) return;

    void (async () => {
      await refreshWallet();
      const raw = sessionStorage.getItem(PENDING_GENERATE_KEY);
      if (raw) {
        try {
          const pending = JSON.parse(raw) as PendingGenerate;
          if (pending.spotId === spotId) {
            alert(t.billing.autoRetrying);
            await runGenerateRequest(pending);
          }
        } catch {
          alert(t.billing.paidSuccess);
        }
      } else {
        alert(t.billing.paidSuccess);
      }
      router.replace(`/dress-up/${spotId}`);
    })();
  }, [refreshWallet, router, runGenerateRequest, spotId, t.billing]);

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
    [],
  );

  const toggleJewelry = (item: Jewelry) => {
    setSelectedJewelry((prev) =>
      prev.find((j) => j.id === item.id)
        ? prev.filter((j) => j.id !== item.id)
        : [...prev, item],
    );
  };

  const handleGenerate = async () => {
    if (!photo || !selectedCostume || !selectedHeadwear || !selectedMakeup) {
      alert(t.dressUp.alertIncomplete);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const photoBase64 = ev.target?.result as string;
      await runGenerateRequest({
        spotId,
        photoBase64,
        photoType,
        costumeId: selectedCostume.id,
        jewelryIds: selectedJewelry.map((j) => j.id),
        headwearId: selectedHeadwear.id,
        makeupId: selectedMakeup.id,
      });
    };
    reader.readAsDataURL(photo);
  };

  const handleSave = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${t.common.brand}-${scenicSpot?.name || t.dressUp.downloadFallback}-${Date.now()}.png`;
      link.click();
    }
  };

  const handleSaveWatermark = async () => {
    if (!generatedImage) return;
    try {
      const marked = await watermarkImage(generatedImage, t.common.brand);
      const link = document.createElement('a');
      link.href = marked;
      link.download = `${t.common.brand}-${scenicSpot?.name || t.dressUp.downloadFallback}-wm-${Date.now()}.png`;
      link.click();
    } catch {
      alert(t.dressUp.alertRetry);
    }
  };

  const handleCopyShareLink = async () => {
    const url = buildScenicShareUrl(spotId);
    try {
      await navigator.clipboard.writeText(url);
      setShareHint(t.billing.shareCopied);
      window.setTimeout(() => setShareHint(null), 2000);
    } catch {
      setShareHint(url);
    }
  };

  const handlePaid = async () => {
    await refreshWallet();
    const raw = sessionStorage.getItem(PENDING_GENERATE_KEY);
    if (raw) {
      try {
        const pending = JSON.parse(raw) as PendingGenerate;
        if (pending.spotId === spotId) {
          alert(t.billing.autoRetrying);
          await runGenerateRequest(pending);
          return;
        }
      } catch {
        // fall through
      }
    }
    alert(t.billing.paidSuccess);
  };

  if (!scenicSpot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-yanhui">{t.dressUp.spotMissing}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subai">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-daiqing hover:text-xiangse transition-colors"
            aria-label={t.dressUp.backHomeAria}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{t.dressUp.backHome}</span>
          </button>
          <h1 className="font-serif text-xl text-daiqing">
            {scenicSpot.name}
            {locale === 'zh' ? '' : ' '}
            {t.dressUp.titleSuffix}
          </h1>
          <div className="flex items-center gap-2 pr-16 sm:pr-20">
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className="text-sm text-daiqing bg-yuebai/60 hover:bg-yuebai px-3 py-1.5 rounded-full transition-colors"
            >
              {format(t.billing.creditsLabel, {
                n: wallet?.available ?? '…',
              })}
            </button>
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className="text-sm text-white bg-daiqing hover:bg-daiqing/90 px-3 py-1.5 rounded-full transition-colors"
            >
              {t.billing.buyCredits}
            </button>
          </div>
        </div>
      </header>

      <section
        className="relative h-48 overflow-hidden"
        aria-labelledby="spot-heading"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          aria-label={format(t.dressUp.spotBgAria, {
            province: scenicSpot.province,
            name: scenicSpot.name,
          })}
          style={{ backgroundImage: `url(${scenicSpot.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-daiqing/70 to-transparent" />
        <div className="relative z-10 h-full flex items-center px-8">
          <div>
            <p className="text-yuebai/80 text-sm mb-1">{scenicSpot.province}</p>
            <h2
              id="spot-heading"
              className="font-serif text-3xl text-white mb-2"
            >
              {scenicSpot.name}
            </h2>
            <p className="text-yuebai/90 text-sm max-w-md">
              {scenicSpot.description}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg text-daiqing mb-4">
                {t.dressUp.uploadPhoto}
              </h3>
              <div className="space-y-4">
                <div
                  className="flex gap-2"
                  role="group"
                  aria-label={t.dressUp.photoTypeAria}
                >
                  <button
                    onClick={() => setPhotoType('full-body')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      photoType === 'full-body'
                        ? 'bg-daiqing text-white'
                        : 'bg-yuebai/50 text-daiqing hover:bg-yuebai'
                    }`}
                    aria-pressed={photoType === 'full-body'}
                  >
                    {t.dressUp.fullBody}
                  </button>
                  <button
                    onClick={() => setPhotoType('half-body')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      photoType === 'half-body'
                        ? 'bg-daiqing text-white'
                        : 'bg-yuebai/50 text-daiqing hover:bg-yuebai'
                    }`}
                    aria-pressed={photoType === 'half-body'}
                  >
                    {t.dressUp.halfBody}
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
                          alt={format(t.dressUp.photoPreviewAlt, {
                            name: scenicSpot.name,
                          })}
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
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-yanhui text-sm">
                          {format(t.dressUp.clickUpload, {
                            type:
                              photoType === 'full-body'
                                ? t.dressUp.fullBodyShort
                                : t.dressUp.halfBodyShort,
                          })}
                        </p>
                        <p className="text-yanhui/60 text-xs mt-1">
                          {t.dressUp.photoHint}
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

            {generatedImage && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-lg text-daiqing mb-4">
                  {t.dressUp.resultTitle}
                </h3>
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={generatedImage}
                    alt={format(t.dressUp.resultAlt, {
                      name: scenicSpot.name,
                      style: scenicSpot.style,
                    })}
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
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {t.dressUp.saveImage}
                </button>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSaveWatermark()}
                    className="w-full py-2.5 border border-daiqing/20 text-daiqing rounded-xl text-sm hover:bg-yuebai/40 transition-colors"
                  >
                    {t.billing.saveWatermark}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyShareLink()}
                    className="w-full py-2.5 border border-daiqing/20 text-daiqing rounded-xl text-sm hover:bg-yuebai/40 transition-colors"
                  >
                    {t.billing.shareLink}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleGenerate()}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-daiqing text-white rounded-xl text-sm hover:bg-daiqing/90 transition-colors disabled:opacity-50"
                  >
                    {t.billing.regenerate}
                  </button>
                </div>
                {shareHint ? (
                  <p className="text-xs text-yanhui mt-2 break-all">{shareHint}</p>
                ) : null}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <SelectionPanel
              title={t.dressUp.selectCostume}
              items={allCostumes}
              selectedId={selectedCostume?.id}
              onSelect={(item) => setSelectedCostume(item as Costume)}
            />

            <SelectionPanel
              title={t.dressUp.selectJewelry}
              items={allJewelry}
              selectedIds={selectedJewelry.map((j) => j.id)}
              multiSelect
              onSelect={(item) => toggleJewelry(item as Jewelry)}
            />

            <SelectionPanel
              title={t.dressUp.selectHeadwear}
              items={allHeadwear}
              selectedId={selectedHeadwear?.id}
              onSelect={(item) => setSelectedHeadwear(item as Headwear)}
            />

            <SelectionPanel
              title={t.dressUp.selectMakeup}
              items={allMakeup}
              selectedId={selectedMakeup?.id}
              onSelect={(item) => setSelectedMakeup(item as Makeup)}
            />

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
                      aria-hidden="true"
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
                    {t.dressUp.generating}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {t.dressUp.generate}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreditsPaywall
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        wallet={wallet}
        returnPath={`/dress-up/${spotId}`}
        onRefreshWallet={refreshWallet}
        onPaid={() => {
          void handlePaid();
        }}
      />
    </div>
  );
}

interface SelectionPanelProps<
  T extends { id: string; name: string; image: string; description: string },
> {
  title: string;
  items: T[];
  selectedId?: string;
  selectedIds?: string[];
  multiSelect?: boolean;
  onSelect: (item: T) => void;
}

function SelectionPanel<
  T extends { id: string; name: string; image: string; description: string },
>({
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
    <section className="bg-white rounded-2xl p-6 shadow-sm" aria-label={title}>
      <h3 className="font-serif text-lg text-daiqing mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            aria-pressed={isSelected(item.id)}
            aria-label={`${item.name} - ${item.description}`}
            className={`relative group rounded-xl overflow-hidden transition-all ${
              isSelected(item.id)
                ? 'ring-2 ring-xiangse ring-offset-2'
                : 'hover:ring-2 hover:ring-daiqing/30 hover:ring-offset-1'
            }`}
          >
            <div className="aspect-square relative">
              <Image
                src={item.image}
                alt={`${item.name} - ${item.description}`}
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
              <div
                className="absolute top-2 right-2 w-6 h-6 bg-xiangse rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
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
    </section>
  );
}
