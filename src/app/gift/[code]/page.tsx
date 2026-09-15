'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDeviceFingerprint } from '@/lib/client/device-fingerprint';

type PageProps = {
  params: Promise<{ code: string }>;
};

export default function GiftClaimPage({ params }: PageProps) {
  const { code } = use(params);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'ok' | 'claimed' | 'error'
  >('idle');
  const [message, setMessage] = useState('');
  const [available, setAvailable] = useState<number | null>(null);

  const claim = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/billing/gift', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fp': getDeviceFingerprint(),
        },
        body: JSON.stringify({
          code,
          deviceFingerprint: getDeviceFingerprint(),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        alreadyClaimed?: boolean;
        addedCredits?: number;
        available?: number;
      };
      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || '领取失败');
        return;
      }
      if (typeof data.available === 'number') setAvailable(data.available);
      if (data.alreadyClaimed) {
        setStatus('claimed');
        setMessage('该设备或账号已领取过此门店码');
        return;
      }
      setStatus('ok');
      setMessage(`已到账 ${data.addedCredits ?? 1} 次生成额度`);
    } catch {
      setStatus('error');
      setMessage('网络错误，请重试');
    }
  };

  useEffect(() => {
    void claim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <main className="min-h-screen bg-subai flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border p-6 shadow-sm space-y-4 text-center">
        <h1 className="font-serif text-2xl text-daiqing">门店赠送次数</h1>
        <p className="text-sm text-yanhui">
          门店码 <span className="font-mono text-daiqing">{code}</span>
        </p>
        {status === 'loading' ? (
          <p className="text-sm text-yanhui">正在领取…</p>
        ) : null}
        {message ? (
          <p
            className={`text-sm ${
              status === 'error' ? 'text-red-600' : 'text-daiqing'
            }`}
          >
            {message}
          </p>
        ) : null}
        {available != null ? (
          <p className="text-sm text-yanhui">当前可用 {available} 次</p>
        ) : null}
        <div className="flex flex-col gap-2">
          {(status === 'error' || status === 'idle') && (
            <Button className="bg-daiqing" onClick={() => void claim()}>
              重新领取
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">去首页选景区开拍</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
