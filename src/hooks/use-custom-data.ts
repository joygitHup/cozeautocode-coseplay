'use client';

import { useState, useEffect } from 'react';
import type { ScenicSpot, Costume, Jewelry, Headwear, Makeup } from '@/lib/types';

const STORAGE_KEYS = {
  scenicSpots: 'huashangji_custom_scenic_spots',
  costumes: 'huashangji_custom_costumes',
  jewelry: 'huashangji_custom_jewelry',
  headwear: 'huashangji_custom_headwear',
  makeup: 'huashangji_custom_makeup',
};

// 通用 localStorage Hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    setIsLoaded(true);
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

// 自定义景区管理
export function useCustomScenicSpots() {
  const [customSpots, setCustomSpots] = useLocalStorage<ScenicSpot[]>(STORAGE_KEYS.scenicSpots, []);

  const addScenicSpot = (spot: Omit<ScenicSpot, 'id'>) => {
    const newSpot: ScenicSpot = {
      ...spot,
      id: `custom-spot-${Date.now()}`,
    };
    setCustomSpots((prev: ScenicSpot[]) => [...prev, newSpot]);
    return newSpot;
  };

  const removeScenicSpot = (id: string) => {
    setCustomSpots((prev: ScenicSpot[]) => prev.filter((spot: ScenicSpot) => spot.id !== id));
  };

  return { customSpots, addScenicSpot, removeScenicSpot, isLoaded: customSpots !== null };
}

// 自定义服饰管理
export function useCustomCostumes() {
  const [customCostumes, setCustomCostumes] = useLocalStorage<Costume[]>(STORAGE_KEYS.costumes, []);

  const addCostume = (costume: Omit<Costume, 'id'>) => {
    const newCostume: Costume = {
      ...costume,
      id: `custom-costume-${Date.now()}`,
    };
    setCustomCostumes((prev: Costume[]) => [...prev, newCostume]);
    return newCostume;
  };

  const removeCostume = (id: string) => {
    setCustomCostumes((prev: Costume[]) => prev.filter((c: Costume) => c.id !== id));
  };

  return { customCostumes, addCostume, removeCostume, isLoaded: customCostumes !== null };
}

// 自定义首饰管理
export function useCustomJewelry() {
  const [customJewelry, setCustomJewelry] = useLocalStorage<Jewelry[]>(STORAGE_KEYS.jewelry, []);

  const addJewelry = (item: Omit<Jewelry, 'id'>) => {
    const newItem: Jewelry = {
      ...item,
      id: `custom-jewelry-${Date.now()}`,
    };
    setCustomJewelry((prev: Jewelry[]) => [...prev, newItem]);
    return newItem;
  };

  const removeJewelry = (id: string) => {
    setCustomJewelry((prev: Jewelry[]) => prev.filter((j: Jewelry) => j.id !== id));
  };

  return { customJewelry, addJewelry, removeJewelry, isLoaded: customJewelry !== null };
}

// 自定义头饰管理
export function useCustomHeadwear() {
  const [customHeadwear, setCustomHeadwear] = useLocalStorage<Headwear[]>(STORAGE_KEYS.headwear, []);

  const addHeadwear = (item: Omit<Headwear, 'id'>) => {
    const newItem: Headwear = {
      ...item,
      id: `custom-headwear-${Date.now()}`,
    };
    setCustomHeadwear((prev: Headwear[]) => [...prev, newItem]);
    return newItem;
  };

  const removeHeadwear = (id: string) => {
    setCustomHeadwear((prev: Headwear[]) => prev.filter((h: Headwear) => h.id !== id));
  };

  return { customHeadwear, addHeadwear, removeHeadwear, isLoaded: customHeadwear !== null };
}

// 自定义妆容管理
export function useCustomMakeup() {
  const [customMakeup, setCustomMakeup] = useLocalStorage<Makeup[]>(STORAGE_KEYS.makeup, []);

  const addMakeup = (item: Omit<Makeup, 'id'>) => {
    const newItem: Makeup = {
      ...item,
      id: `custom-makeup-${Date.now()}`,
    };
    setCustomMakeup((prev: Makeup[]) => [...prev, newItem]);
    return newItem;
  };

  const removeMakeup = (id: string) => {
    setCustomMakeup((prev: Makeup[]) => prev.filter((m: Makeup) => m.id !== id));
  };

  return { customMakeup, addMakeup, removeMakeup, isLoaded: customMakeup !== null };
}

// 合并系统数据和自定义数据的 Hook
export function useMergedData<T extends { id: string }>(
  systemData: T[],
  customData: T[],
  isLoaded: boolean
): T[] {
  const [mergedData, setMergedData] = useState<T[]>([]);

  useEffect(() => {
    if (isLoaded) {
      setMergedData([...systemData, ...customData]);
    }
  }, [systemData, customData, isLoaded]);

  return mergedData;
}
