'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDeviceFingerprint } from '@/lib/client/device-fingerprint';

export type WalletPack = {
  id: string;
  nameZh: string;
  nameEn: string;
  credits: number;
  priceFen: number;
  listPriceFen?: number;
  discountFen?: number;
  priceYuan: string;
  listPriceYuan?: string;
  featured?: boolean;
  descriptionZh: string;
  descriptionEn: string;
  firstPurchaseEligible?: boolean;
};

export type WalletState = {
  credits: number;
  freeLeft: number;
  available: number;
  phone?: string | null;
  paymentMode?: 'mock' | 'xunhupay';
  firstPurchaseEligible?: boolean;
  firstPurchaseDiscountFen?: number;
  packs: WalletPack[];
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/billing/wallet', {
        credentials: 'include',
        headers: {
          'x-device-fp': getDeviceFingerprint(),
        },
      });
      if (!response.ok) return;
      const data = (await response.json()) as WalletState;
      setWallet(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { wallet, loading, refresh, setWallet };
}
