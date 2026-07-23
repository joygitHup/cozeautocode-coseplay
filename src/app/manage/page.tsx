'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useCustomScenicSpots,
  useCustomCostumes,
  useCustomJewelry,
  useCustomHeadwear,
  useCustomMakeup,
} from '@/hooks/use-custom-data';
import { scenicSpots } from '@/lib/data/scenic-spots';
import { costumes } from '@/lib/data/costumes';
import { jewelry } from '@/lib/data/jewelry';
import { headwear } from '@/lib/data/headwear';
import { makeupStyles } from '@/lib/data/makeup';
import type { ScenicSpot, Costume, Jewelry, Headwear, Makeup } from '@/lib/types';

type TabType = 'scenic' | 'costume' | 'jewelry' | 'headwear' | 'makeup';

export default function ManagePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('scenic');

  const { customSpots, addScenicSpot, removeScenicSpot } = useCustomScenicSpots();
  const { customCostumes, addCostume, removeCostume } = useCustomCostumes();
  const { customJewelry, addJewelry, removeJewelry } = useCustomJewelry();
  const { customHeadwear, addHeadwear, removeHeadwear } = useCustomHeadwear();
  const { customMakeup, addMakeup, removeMakeup } = useCustomMakeup();

  const tabs = [
    { id: 'scenic' as TabType, label: '场景', count: customSpots.length },
    { id: 'costume' as TabType, label: '服饰', count: customCostumes.length },
    { id: 'jewelry' as TabType, label: '首饰', count: customJewelry.length },
    { id: 'headwear' as TabType, label: '头饰', count: customHeadwear.length },
    { id: 'makeup' as TabType, label: '妆容', count: customMakeup.length },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="text-[#4A5859] hover:bg-[#D6ECF0]/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-serif text-[#4A5859]">自定义管理</h1>
              <p className="text-sm text-[#9B9B9B]">添加你喜欢的场景和装扮</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#4A5859] text-white'
                  : 'bg-white text-[#4A5859] hover:bg-[#D6ECF0]/30'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'scenic' && (
          <ScenicSpotForm
            onAdd={addScenicSpot}
            onRemove={removeScenicSpot}
            customItems={customSpots}
            systemItems={scenicSpots}
          />
        )}
        {activeTab === 'costume' && (
          <CostumeForm
            onAdd={addCostume}
            onRemove={removeCostume}
            customItems={customCostumes}
            systemItems={costumes}
          />
        )}
        {activeTab === 'jewelry' && (
          <JewelryForm
            onAdd={addJewelry}
            onRemove={removeJewelry}
            customItems={customJewelry}
            systemItems={jewelry}
          />
        )}
        {activeTab === 'headwear' && (
          <HeadwearForm
            onAdd={addHeadwear}
            onRemove={removeHeadwear}
            customItems={customHeadwear}
            systemItems={headwear}
          />
        )}
        {activeTab === 'makeup' && (
          <MakeupForm
            onAdd={addMakeup}
            onRemove={removeMakeup}
            customItems={customMakeup}
            systemItems={makeupStyles}
          />
        )}
      </div>
    </div>
  );
}

// 图片上传组件
function ImageUpload({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      {value ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[#E5E7EB]">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#4A5859] transition-colors">
          <Upload className="w-8 h-8 text-[#9B9B9B] mb-2" />
          <span className="text-sm text-[#9B9B9B]">点击上传图片</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      )}
    </div>
  );
}

// 场景表单
function ScenicSpotForm({
  onAdd,
  onRemove,
  customItems,
  systemItems,
}: {
  onAdd: (item: Omit<ScenicSpot, 'id'>) => void;
  onRemove: (id: string) => void;
  customItems: ScenicSpot[];
  systemItems: ScenicSpot[];
}) {
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !province || !description || !style || !image) return;
    onAdd({ name, province, description, style, image, recommendedCostumes: [] });
    setName('');
    setProvince('');
    setDescription('');
    setStyle('');
    setImage('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-serif text-[#4A5859]">添加新场景</h3>
        <div>
          <Label>场景名称</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：九寨沟" />
        </div>
        <div>
          <Label>所在省份</Label>
          <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="如：四川" />
        </div>
        <div>
          <Label>场景描述</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这个场景的特色和氛围"
          />
        </div>
        <div>
          <Label>风格定位</Label>
          <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="如：清新自然" />
        </div>
        <div>
          <Label>场景图片</Label>
          <ImageUpload value={image} onChange={setImage} />
        </div>
        <Button type="submit" className="w-full bg-[#4A5859] hover:bg-[#3A4849]">
          添加场景
        </Button>
      </form>

      {customItems.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-serif text-[#4A5859] mb-4">我添加的场景</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {customItems.map((item) => (
              <div key={item.id} className="relative group">
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
                <p className="mt-2 text-sm font-medium text-[#2C2C2C]">{item.name}</p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-serif text-[#4A5859] mb-4">系统预设场景 ({systemItems.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {systemItems.map((item) => (
            <div key={item.id}>
              <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
              <p className="mt-2 text-sm font-medium text-[#2C2C2C]">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 服饰表单
function CostumeForm({
  onAdd,
  onRemove,
  customItems,
  systemItems,
}: {
  onAdd: (item: Omit<Costume, 'id'>) => void;
  onRemove: (id: string) => void;
  customItems: Costume[];
  systemItems: Costume[];
}) {
  const [name, setName] = useState('');
  const [dynasty, setDynasty] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const [category, setCategory] = useState<Costume['category']>('dress');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dynasty || !description || !style || !image) return;
    onAdd({ name, dynasty, description, style, category, image });
    setName('');
    setDynasty('');
    setDescription('');
    setStyle('');
    setCategory('dress');
    setImage('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-serif text-[#4A5859]">添加新服饰</h3>
        <div>
          <Label>服饰名称</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：齐胸襦裙" />
        </div>
        <div>
          <Label>朝代</Label>
          <Input value={dynasty} onChange={(e) => setDynasty(e.target.value)} placeholder="如：唐" />
        </div>
        <div>
          <Label>风格</Label>
          <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="如：华丽" />
        </div>
        <div>
          <Label>类别</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Costume['category'])}
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A5859]"
          >
            <option value="dress">裙装</option>
            <option value="robe">袍服</option>
            <option value="jacket">上衣</option>
            <option value="skirt">下裙</option>
          </select>
        </div>
        <div>
          <Label>服饰描述</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这款服饰的特点"
          />
        </div>
        <div>
          <Label>服饰图片</Label>
          <ImageUpload value={image} onChange={setImage} />
        </div>
        <Button type="submit" className="w-full bg-[#4A5859] hover:bg-[#3A4849]">
          添加服饰
        </Button>
      </form>

      {customItems.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-serif text-[#4A5859] mb-4">我添加的服饰</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {customItems.map((item) => (
              <div key={item.id} className="relative group">
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
                <p className="mt-2 text-sm font-medium text-[#2C2C2C]">{item.name}</p>
                <p className="text-xs text-[#9B9B9B]">{item.dynasty}代</p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-serif text-[#4A5859] mb-4">系统预设服饰 ({systemItems.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {systemItems.slice(0, 6).map((item) => (
            <div key={item.id}>
              <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
              <p className="mt-2 text-sm font-medium text-[#2C2C2C]">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 首饰表单
function JewelryForm({
  onAdd,
  onRemove,
  customItems,
  systemItems,
}: {
  onAdd: (item: Omit<Jewelry, 'id'>) => void;
  onRemove: (id: string) => void;
  customItems: Jewelry[];
  systemItems: Jewelry[];
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Jewelry['category']>('necklace');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !image) return;
    onAdd({ name, category, description, image });
    setName('');
    setCategory('necklace');
    setDescription('');
    setImage('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-serif text-[#4A5859]">添加新首饰</h3>
        <div>
          <Label>首饰名称</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：珍珠项链" />
        </div>
        <div>
          <Label>首饰类别</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Jewelry['category'])}
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A5859]"
          >
            <option value="necklace">项链</option>
            <option value="bracelet">手镯</option>
            <option value="earring">耳饰</option>
            <option value="ring">戒指</option>
            <option value="hairpin">发簪</option>
          </select>
        </div>
        <div>
          <Label>首饰描述</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这款首饰的特点"
          />
        </div>
        <div>
          <Label>首饰图片</Label>
          <ImageUpload value={image} onChange={setImage} />
        </div>
        <Button type="submit" className="w-full bg-[#4A5859] hover:bg-[#3A4849]">
          添加首饰
        </Button>
      </form>

      {customItems.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-serif text-[#4A5859] mb-4">我添加的首饰</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {customItems.map((item) => (
              <div key={item.id} className="relative group">
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
                <p className="mt-2 text-sm font-medium text-[#2C2C2C]">{item.name}</p>
                <p className="text-xs text-[#9B9B9B]">{item.category}</p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 头饰表单
function HeadwearForm({
  onAdd,
  onRemove,
  customItems,
  systemItems,
}: {
  onAdd: (item: Omit<Headwear, 'id'>) => void;
  onRemove: (id: string) => void;
  customItems: Headwear[];
  systemItems: Headwear[];
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Headwear['category']>('crown');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !image) return;
    onAdd({ name, category, description, image });
    setName('');
    setCategory('crown');
    setDescription('');
    setImage('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-serif text-[#4A5859]">添加新头饰</h3>
        <div>
          <Label>头饰名称</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：步摇" />
        </div>
        <div>
          <Label>头饰类别</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Headwear['category'])}
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A5859]"
          >
            <option value="crown">冠冕</option>
            <option value="hairpin">发簪</option>
            <option value="flower">花饰</option>
            <option value="veil">面纱</option>
            <option value="comb">梳篦</option>
          </select>
        </div>
        <div>
          <Label>头饰描述</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这款头饰的特点"
          />
        </div>
        <div>
          <Label>头饰图片</Label>
          <ImageUpload value={image} onChange={setImage} />
        </div>
        <Button type="submit" className="w-full bg-[#4A5859] hover:bg-[#3A4849]">
          添加头饰
        </Button>
      </form>

      {customItems.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-serif text-[#4A5859] mb-4">我添加的头饰</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {customItems.map((item) => (
              <div key={item.id} className="relative group">
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
                <p className="mt-2 text-sm font-medium text-[#2C2C2C]">{item.name}</p>
                <p className="text-xs text-[#9B9B9B]">{item.category}</p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 妆容表单
function MakeupForm({
  onAdd,
  onRemove,
  customItems,
  systemItems,
}: {
  onAdd: (item: Omit<Makeup, 'id'>) => void;
  onRemove: (id: string) => void;
  customItems: Makeup[];
  systemItems: Makeup[];
}) {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const [category, setCategory] = useState<Makeup['category']>('elegant');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !style || !description || !image) return;
    onAdd({ name, style, category, description, image });
    setName('');
    setStyle('');
    setCategory('elegant');
    setDescription('');
    setImage('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-serif text-[#4A5859]">添加新妆容</h3>
        <div>
          <Label>妆容名称</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：桃花妆" />
        </div>
        <div>
          <Label>妆容风格</Label>
          <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="如：清新" />
        </div>
        <div>
          <Label>妆容类别</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Makeup['category'])}
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A5859]"
          >
            <option value="elegant">典雅</option>
            <option value="natural">自然</option>
            <option value="glamorous">华丽</option>
            <option value="ethereal">仙气</option>
          </select>
        </div>
        <div>
          <Label>妆容描述</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这款妆容的特点"
          />
        </div>
        <div>
          <Label>妆容图片</Label>
          <ImageUpload value={image} onChange={setImage} />
        </div>
        <Button type="submit" className="w-full bg-[#4A5859] hover:bg-[#3A4849]">
          添加妆容
        </Button>
      </form>

      {customItems.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-serif text-[#4A5859] mb-4">我添加的妆容</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {customItems.map((item) => (
              <div key={item.id} className="relative group">
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
                <p className="mt-2 text-sm font-medium text-[#2C2C2C]">{item.name}</p>
                <p className="text-xs text-[#9B9B9B]">{item.style}</p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
