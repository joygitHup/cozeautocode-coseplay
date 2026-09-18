'use client';

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import type { WalletState } from '@/hooks/use-wallet';
import { getDeviceFingerprint } from '@/lib/client/device-fingerprint';

type CreditsPaywallProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: WalletState | null;
  onPaid: () => void;
  returnPath?: string;
  onRefreshWallet?: () => Promise<void> | void;
};

type PayScene = 'native' | 'h5' | 'jsapi' | undefined;

type CheckoutResponse = {
  payUrl?: string;
  orderId?: string;
  mock?: boolean;
  scene?: PayScene;
  codeUrl?: string;
  mwebUrl?: string;
  jsapiParams?: Record<string, string>;
  needOAuth?: boolean;
  authorizeUrl?: string;
  error?: string;
};

declare global {
  interface Window {
    WeixinJSBridge?: {
      invoke: (
        api: string,
        params: Record<string, string>,
        callback: (res: { err_msg?: string }) => void,
      ) => void;
    };
  }
}

export function CreditsPaywall({
  open,
  onOpenChange,
  wallet,
  onPaid,
  returnPath,
  onRefreshWallet,
}: CreditsPaywallProps) {
  const { locale, t, format } = useI18n();
  const [busyPackId, setBusyPackId] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneMsg, setPhoneMsg] = useState<string | null>(null);
  const [bindingPhone, setBindingPhone] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [payScene, setPayScene] = useState<PayScene>(undefined);
  const [nativeHint, setNativeHint] = useState<string | null>(null);

  useEffect(() => {
    if (wallet?.phone) setPhone(wallet.phone);
  }, [wallet?.phone]);

  useEffect(() => {
    if (!pendingOrderId) return;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/billing/orders/${pendingOrderId}`, {
        credentials: 'include',
      });
      if (!response.ok) return;
      const data = (await response.json()) as { status: string };
      if (data.status === 'paid') {
        window.clearInterval(timer);
        setPendingOrderId(null);
        setBusyPackId(null);
        setQrDataUrl(null);
        setPayScene(undefined);
        setNativeHint(null);
        onPaid();
        onOpenChange(false);
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, [pendingOrderId, onPaid, onOpenChange]);

  const handleBuy = useCallback(
    async (
      packId: string,
      channel: 'wechat' | 'alipay' | 'mock',
    ) => {
      setError(null);
      setQrDataUrl(null);
      setPayScene(undefined);
      setNativeHint(null);
      setBusyPackId(packId);
      try {
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'x-device-fp': getDeviceFingerprint(),
          },
          body: JSON.stringify({
            packId,
            channel,
            returnPath: returnPath
              ? `${returnPath}?paid=1`
              : undefined,
          }),
        });
        const data = (await response.json()) as CheckoutResponse;
        if (!response.ok || !data.orderId) {
          setError(data.error || t.billing.checkoutFailed);
          setBusyPackId(null);
          return;
        }

        // JSAPI 需要 OAuth 拿 openid
        if (data.needOAuth && data.authorizeUrl) {
          window.location.href = data.authorizeUrl;
          return;
        }

        setPendingOrderId(data.orderId);

        // mock 模式：直接跳 mock-pay
        if (data.mock && data.payUrl) {
          const url = new URL(data.payUrl, window.location.origin);
          if (returnPath) {
            url.searchParams.set(
              'returnTo',
              `${window.location.origin}${returnPath}?paid=1&orderId=${data.orderId}`,
            );
          }
          window.open(url.toString(), '_blank', 'noopener,noreferrer');
          return;
        }

        // 微信直连
        if (data.scene === 'native' && data.codeUrl) {
          const dataUrl = await QRCode.toDataURL(data.codeUrl, {
            margin: 2,
            width: 240,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrDataUrl(dataUrl);
          setPayScene('native');
          setNativeHint(t.billing.wechatScanQr);
          setBusyPackId(null);
          return;
        }

        if (data.scene === 'h5' && data.mwebUrl) {
          const url = new URL(data.mwebUrl, window.location.origin);
          if (returnPath) {
            url.searchParams.set(
              'returnTo',
              `${window.location.origin}${returnPath}?paid=1&orderId=${data.orderId}`,
            );
          }
          window.open(url.toString(), '_blank', 'noopener,noreferrer');
          return;
        }

        if (data.scene === 'jsapi' && data.jsapiParams && window.WeixinJSBridge) {
          window.WeixinJSBridge.invoke(
            'requestPayment',
            data.jsapiParams,
            (res) => {
              if (res.err_msg && res.err_msg !== 'get_brand_wcpay_request:ok') {
                setError(t.billing.checkoutFailed);
                setBusyPackId(null);
              }
            },
          );
          return;
        }

        // 其他情况兜底
        if (data.payUrl) {
          window.open(data.payUrl, '_blank', 'noopener,noreferrer');
        }
      } catch {
        setError(t.billing.checkoutFailed);
        setBusyPackId(null);
      }
    },
    [returnPath, t.billing.checkoutFailed, t.billing.wechatScanQr, onPaid, onOpenChange],
  );

  const bindPhone = async () => {
    setPhoneMsg(null);
    setBindingPhone(true);
    try {
      const response = await fetch('/api/billing/phone', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = (await response.json()) as {
        error?: string;
        mergedFromGuestId?: string | null;
      };
      if (!response.ok) {
        setPhoneMsg(data.error || t.billing.phoneBindFailed);
        return;
      }
      setPhoneMsg(
        data.mergedFromGuestId
          ? t.billing.phoneMerged
          : t.billing.phoneBindSuccess,
      );
      await onRefreshWallet?.();
    } catch {
      setPhoneMsg(t.billing.phoneBindFailed);
    } finally {
      setBindingPhone(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.billing.buyTitle}</SheetTitle>
          <SheetDescription>
            {t.billing.buyDesc}{' '}
            {wallet
              ? t.billing.remaining.replace('{n}', String(wallet.available))
              : ''}
          </SheetDescription>
        </SheetHeader>

        {wallet?.firstPurchaseEligible ? (
          <p className="mt-4 mx-1 text-sm text-xiangse bg-xiangse/10 rounded-xl px-3 py-2">
            {format(t.billing.firstPurchaseBanner, {
              yuan: ((wallet.firstPurchaseDiscountFen ?? 0) / 100).toFixed(
                (wallet.firstPurchaseDiscountFen ?? 0) % 100 === 0 ? 0 : 2,
              ),
            })}
          </p>
        ) : null}

        {qrDataUrl && payScene === 'native' ? (
          <div className="mt-6 flex flex-col items-center gap-3 px-1">
            <img
              src={qrDataUrl}
              alt={t.billing.wechatScanQr}
              className="w-60 h-60 rounded-xl border border-yuebai"
            />
            <p className="text-sm text-daiqing text-center">
              {nativeHint ?? t.billing.wechatScanQr}
            </p>
            <p className="text-xs text-yanhui text-center">
              {t.billing.waitingPay}
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-3 px-1">
          {(wallet?.packs ?? []).map((pack) => {
            const name = locale === 'zh' ? pack.nameZh : pack.nameEn;
            const desc =
              locale === 'zh' ? pack.descriptionZh : pack.descriptionEn;
            return (
              <div
                key={pack.id}
                className={`rounded-2xl border p-4 ${
                  pack.featured
                    ? 'border-xiangse bg-xiangse/10'
                    : 'border-yuebai bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-lg text-daiqing">
                      {name}
                      {pack.featured ? (
                        <span className="ml-2 text-xs text-xiangse">
                          {t.billing.featured}
                        </span>
                      ) : null}
                      {pack.firstPurchaseEligible ? (
                        <span className="ml-2 text-xs text-xiangse">
                          {t.billing.firstPurchaseTag}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-yanhui mt-1">{desc}</p>
                    <p className="text-sm text-daiqing mt-2">
                      {pack.credits} {t.billing.creditsUnit} · ¥{pack.priceYuan}
                      {(pack.discountFen ?? 0) > 0 && pack.listPriceYuan ? (
                        <span className="ml-2 text-yanhui line-through">
                          ¥{pack.listPriceYuan}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {wallet?.paymentMode === 'mock' ? (
                    <Button
                      className="flex-1 bg-daiqing hover:bg-daiqing/90"
                      disabled={busyPackId !== null}
                      onClick={() => handleBuy(pack.id, 'mock')}
                    >
                      {busyPackId === pack.id
                        ? t.billing.processing
                        : t.billing.payMock}
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="flex-1 bg-daiqing hover:bg-daiqing/90"
                        disabled={busyPackId !== null}
                        onClick={() => handleBuy(pack.id, 'wechat')}
                      >
                        {busyPackId === pack.id
                          ? t.billing.processing
                          : t.billing.payWechat}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 cursor-not-allowed opacity-50"
                        disabled
                        aria-disabled="true"
                        title={t.billing.payAlipayComingSoon}
                      >
                        {t.billing.payAlipayComingSoon}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 px-1 space-y-2 border-t pt-4">
          <p className="text-sm font-medium text-daiqing">{t.billing.bindPhone}</p>
          <p className="text-xs text-yanhui">{t.billing.bindPhoneHint}</p>
          <div className="flex gap-2">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.billing.phonePlaceholder}
              inputMode="numeric"
            />
            <Button
              variant="outline"
              disabled={bindingPhone}
              onClick={() => void bindPhone()}
            >
              {bindingPhone ? t.billing.processing : t.billing.bindAction}
            </Button>
          </div>
          {phoneMsg ? <p className="text-xs text-daiqing">{phoneMsg}</p> : null}
        </div>

        {pendingOrderId ? (
          <p className="mt-4 text-sm text-yanhui px-1">{t.billing.waitingPay}</p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm text-red-600 px-1">{error}</p>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
