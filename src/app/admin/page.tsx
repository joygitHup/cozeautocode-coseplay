'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AdminPayload = {
  stats: {
    todayOrderCount: number;
    todayPaidCount: number;
    todayRevenueFen: number;
    paySuccessRate: number;
    todayGenerations: number;
    todaySuccess: number;
    todayFailed: number;
    generationFailRate: number;
    totalWallets: number;
    totalPaidOrders: number;
    totalRevenueFen: number;
    last7Days: {
      revenueFen: number;
      paidOrders: number;
      orderCount: number;
      paySuccessRate: number;
      generations: number;
      generationFailRate: number;
      uniqueGenerators: number;
      uniquePayers: number;
      freeUsers: number;
      convertedFreeUsers: number;
      trialToPaidRate: number;
      aovFen: number;
      targetTrialToPaidMin: number;
      targetTrialToPaidMax: number;
      targetAovFen: number;
    };
  };
  orders: Array<{
    id: string;
    guestId: string;
    packId: string;
    credits: number;
    amountFen: number;
    discountFen?: number;
    channel: string;
    status: string;
    createdAt: string;
    paidAt: string | null;
  }>;
  generations: Array<{
    id: string;
    guestId: string;
    scenicSpotId: string | null;
    success: boolean;
    usedFree: boolean;
    durationMs: number | null;
    errorMessage: string | null;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    nameZh: string;
    credits: number;
    priceYuan: string;
    firstPurchasePriceYuan: string;
    unitPriceYuan: string;
    estimatedMarginYuan: string;
    featured: boolean;
  }>;
  storeCodes: Array<{
    code: string;
    label: string;
    credits: number;
    maxClaims: number;
    active: boolean;
    claimCount: number;
    giftUrl: string;
    createdAt: string;
  }>;
  pricing: {
    firstPurchaseDiscountEnabled: boolean;
    firstPurchaseDiscountFen: number;
    firstPurchasePackIds: string[];
    packPriceOverrides: Record<string, number>;
  };
  unitEconomics: {
    estimatedCostCny: number;
    freePerGuest: number;
    storeBackend?: 'postgres' | 'json';
    note: string;
  };
};

function yuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [storeLabel, setStoreLabel] = useState('旅拍门店赠送');
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountFen, setDiscountFen] = useState(200);
  const [packPrices, setPackPrices] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin', { credentials: 'include' });
      if (response.status === 401) {
        setAuthed(false);
        setData(null);
        return;
      }
      if (!response.ok) {
        setError('加载失败');
        return;
      }
      const json = (await response.json()) as AdminPayload;
      setData(json);
      setAuthed(true);
      setDiscountEnabled(json.pricing.firstPurchaseDiscountEnabled);
      setDiscountFen(json.pricing.firstPurchaseDiscountFen);
      const prices: Record<string, string> = {};
      for (const pack of json.products) {
        prices[pack.id] = String(Math.round(Number(pack.priceYuan) * 100));
      }
      setPackPrices(prices);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const login = async () => {
    setError(null);
    const response = await fetch('/api/admin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password }),
    });
    if (!response.ok) {
      setError('密码错误');
      return;
    }
    setPassword('');
    await load();
  };

  const logout = async () => {
    await fetch('/api/admin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setAuthed(false);
    setData(null);
  };

  const markPaid = async (orderId: string) => {
    await fetch('/api/admin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid', orderId }),
    });
    await load();
  };

  const createStore = async () => {
    await fetch('/api/admin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_store_code',
        label: storeLabel,
        credits: 1,
      }),
    });
    await load();
  };

  const toggleStore = async (code: string, active: boolean) => {
    await fetch('/api/admin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_store_code', code, active }),
    });
    await load();
  };

  const savePricing = async () => {
    await fetch('/api/admin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_pricing',
        pricing: {
          firstPurchaseDiscountEnabled: discountEnabled,
          firstPurchaseDiscountFen: discountFen,
          firstPurchasePackIds: ['trial'],
        },
      }),
    });
    for (const [packId, fenText] of Object.entries(packPrices)) {
      const fen = Number.parseInt(fenText, 10);
      if (!Number.isFinite(fen)) continue;
      await fetch('/api/admin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_pack_price',
          packId,
          priceFen: fen,
        }),
      });
    }
    await load();
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <h1 className="font-serif text-2xl text-[#4A5859]">运营看板</h1>
          <p className="text-sm text-[#9B9B9B]">
            口令登录。默认密码见环境变量 ADMIN_PASSWORD。
          </p>
          <div className="space-y-2">
            <Label htmlFor="admin-password">管理员密码</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void login();
              }}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full bg-[#4A5859]" onClick={() => void login()}>
            登录
          </Button>
        </div>
      </main>
    );
  }

  const stats = data?.stats;
  const week = stats?.last7Days;

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-[#4A5859]">运营看板</h1>
            <p className="text-sm text-[#9B9B9B] mt-1">
              7 日转化 · 订单 · 门店码 · 首充/调价
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              刷新
            </Button>
            <Button variant="ghost" onClick={() => void logout()}>
              退出
            </Button>
          </div>
        </header>

        {stats ? (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="今日收入" value={`¥${yuan(stats.todayRevenueFen)}`} />
            <StatCard
              title="支付成功率"
              value={`${stats.paySuccessRate}%`}
              sub={`${stats.todayPaidCount}/${stats.todayOrderCount}`}
            />
            <StatCard
              title="今日生成"
              value={String(stats.todayGenerations)}
              sub={`失败率 ${stats.generationFailRate}%`}
            />
            <StatCard
              title="累计收入"
              value={`¥${yuan(stats.totalRevenueFen)}`}
              sub={`${stats.totalPaidOrders} 笔 · ${stats.totalWallets} 钱包`}
            />
          </section>
        ) : null}

        {week ? (
          <section className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-serif text-xl text-[#4A5859]">近 7 日转化与毛利盯盘</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title="试用→付费转化"
                value={`${week.trialToPaidRate}%`}
                sub={`目标 ${week.targetTrialToPaidMin}–${week.targetTrialToPaidMax}% · ${week.convertedFreeUsers}/${week.freeUsers}`}
              />
              <StatCard
                title="付费客单 AOV"
                value={`¥${yuan(week.aovFen)}`}
                sub={`目标 ≥ ¥${yuan(week.targetAovFen)}`}
              />
              <StatCard
                title="7 日收入"
                value={`¥${yuan(week.revenueFen)}`}
                sub={`${week.paidOrders} 笔 · 成功率 ${week.paySuccessRate}%`}
              />
              <StatCard
                title="7 日生成"
                value={String(week.generations)}
                sub={`失败率 ${week.generationFailRate}% · 付费用户 ${week.uniquePayers}`}
              />
            </div>
            <p className="text-sm text-[#9B9B9B]">
              {week.trialToPaidRate < week.targetTrialToPaidMin
                ? '转化偏低：建议开启/加大首充立减，或强化结果页分享。'
                : week.aovFen < week.targetAovFen
                  ? '客单偏低：可主推畅玩包或上调体验包价格。'
                  : '指标落在健康区间，继续观察失败率与毛利。'}
            </p>
          </section>
        ) : null}

        <section className="bg-white rounded-2xl border p-5 space-y-4">
          <h2 className="font-serif text-xl text-[#4A5859]">首充立减与调价</h2>
          <p className="text-sm text-[#9B9B9B]">
            预估单次成本 ¥{data?.unitEconomics.estimatedCostCny} · 免费{' '}
            {data?.unitEconomics.freePerGuest} 次/访客 · 存储{' '}
            {data?.unitEconomics.storeBackend === 'postgres'
              ? 'PostgreSQL'
              : '本地 JSON'}
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-[#4A5859]">
              <input
                type="checkbox"
                checked={discountEnabled}
                onChange={(e) => setDiscountEnabled(e.target.checked)}
              />
              开启首充立减（默认体验包）
            </label>
            <div className="space-y-1">
              <Label>立减（分）</Label>
              <Input
                className="w-32"
                value={discountFen}
                onChange={(e) =>
                  setDiscountFen(Number.parseInt(e.target.value || '0', 10) || 0)
                }
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#9B9B9B] border-b">
                  <th className="py-2">SKU</th>
                  <th>次数</th>
                  <th>现价（分）</th>
                  <th>首充价</th>
                  <th>单次</th>
                  <th>预估毛利/次</th>
                </tr>
              </thead>
              <tbody>
                {data?.products.map((pack) => (
                  <tr key={pack.id} className="border-b last:border-0">
                    <td className="py-2">
                      {pack.nameZh}
                      {pack.featured ? ' · 主推' : ''}
                    </td>
                    <td>{pack.credits}</td>
                    <td>
                      <Input
                        className="w-28 h-8"
                        value={packPrices[pack.id] ?? ''}
                        onChange={(e) =>
                          setPackPrices((prev) => ({
                            ...prev,
                            [pack.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>¥{pack.firstPurchasePriceYuan}</td>
                    <td>¥{pack.unitPriceYuan}</td>
                    <td>¥{pack.estimatedMarginYuan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="bg-[#4A5859]" onClick={() => void savePricing()}>
            保存定价配置
          </Button>
        </section>

        <section className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-serif text-xl text-[#4A5859]">门店扫码送 1 次</h2>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label>门店备注</Label>
              <Input
                value={storeLabel}
                onChange={(e) => setStoreLabel(e.target.value)}
              />
            </div>
            <Button className="bg-[#4A5859]" onClick={() => void createStore()}>
              生成门店码
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#9B9B9B] border-b">
                  <th className="py-2">码</th>
                  <th>备注</th>
                  <th>领取</th>
                  <th>链接</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {(data?.storeCodes ?? []).map((code) => (
                  <tr key={code.code} className="border-b last:border-0">
                    <td className="py-2 font-mono">{code.code}</td>
                    <td>{code.label}</td>
                    <td>
                      {code.claimCount}/{code.maxClaims}
                    </td>
                    <td className="max-w-[220px] truncate">
                      <a
                        className="text-[#4A5859] underline"
                        href={code.giftUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {code.giftUrl}
                      </a>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void toggleStore(code.code, !code.active)}
                      >
                        {code.active ? '停用' : '启用'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {(data?.storeCodes.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#9B9B9B]">
                      暂无门店码，生成后打印成二维码即可
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-serif text-xl text-[#4A5859]">最近订单</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#9B9B9B] border-b">
                  <th className="py-2">时间</th>
                  <th>订单</th>
                  <th>套餐</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {(data?.orders ?? []).map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-2 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="font-mono text-xs">{order.id}</td>
                    <td>
                      {order.packId} · {order.credits}次
                      {(order.discountFen ?? 0) > 0
                        ? ` · 减¥${yuan(order.discountFen ?? 0)}`
                        : ''}
                    </td>
                    <td>¥{yuan(order.amountFen)}</td>
                    <td>{order.status}</td>
                    <td>
                      {order.status !== 'paid' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void markPaid(order.id)}
                        >
                          标记已支付
                        </Button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
                {(data?.orders.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#9B9B9B]">
                      暂无订单
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-serif text-xl text-[#4A5859]">最近生成</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#9B9B9B] border-b">
                  <th className="py-2">时间</th>
                  <th>景区</th>
                  <th>结果</th>
                  <th>耗时</th>
                  <th>错误</th>
                </tr>
              </thead>
              <tbody>
                {(data?.generations ?? []).map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td>{log.scenicSpotId || '—'}</td>
                    <td>
                      {log.success ? '成功' : '失败'}
                      {log.usedFree ? ' · 免费' : ''}
                    </td>
                    <td>{log.durationMs != null ? `${log.durationMs}ms` : '—'}</td>
                    <td className="max-w-xs truncate text-[#9B9B9B]">
                      {log.errorMessage || '—'}
                    </td>
                  </tr>
                ))}
                {(data?.generations.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#9B9B9B]">
                      暂无生成记录
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border p-4">
      <p className="text-xs text-[#9B9B9B]">{title}</p>
      <p className="text-2xl font-serif text-[#4A5859] mt-1">{value}</p>
      {sub ? <p className="text-xs text-[#9B9B9B] mt-1">{sub}</p> : null}
    </div>
  );
}
