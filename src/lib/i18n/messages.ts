import type { Locale } from './types';

export type Messages = {
  common: {
    brand: string;
    brandEn: string;
    switchToZh: string;
    switchToEn: string;
    language: string;
  };
  home: {
    manageTitle: string;
    manageAria: string;
    heroAria: string;
    heroTagline: string;
    heroSubtitle: string;
    spotsHeading: string;
    spotsSubtitle: string;
    spotsNavAria: string;
    spotAria: string;
    spotImageAria: string;
    howHeading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    footerTagline: string;
  };
  dressUp: {
    backHome: string;
    backHomeAria: string;
    titleSuffix: string;
    spotBgAria: string;
    spotMissing: string;
    uploadPhoto: string;
    photoTypeAria: string;
    fullBody: string;
    halfBody: string;
    clickUpload: string;
    fullBodyShort: string;
    halfBodyShort: string;
    photoHint: string;
    photoPreviewAlt: string;
    resultTitle: string;
    resultAlt: string;
    saveImage: string;
    selectCostume: string;
    selectJewelry: string;
    selectHeadwear: string;
    selectMakeup: string;
    generating: string;
    generate: string;
    alertIncomplete: string;
    alertFailed: string;
    alertRetry: string;
    unknownError: string;
    downloadFallback: string;
  };
  seo: {
    guideTitle: string;
    styleGuide: string;
    outfitTips: string;
    photoTips: string;
    faq: string;
    exploreMore: string;
    relatedNavAria: string;
  };
  billing: {
    creditsLabel: string;
    buyCredits: string;
    buyTitle: string;
    buyDesc: string;
    remaining: string;
    featured: string;
    creditsUnit: string;
    payWechat: string;
    payAlipay: string;
    payMock: string;
    processing: string;
    waitingPay: string;
    checkoutFailed: string;
    needCredits: string;
    paidSuccess: string;
    firstPurchaseBanner: string;
    firstPurchaseTag: string;
    bindPhone: string;
    bindPhoneHint: string;
    phonePlaceholder: string;
    bindAction: string;
    phoneBindSuccess: string;
    phoneBindFailed: string;
    phoneMerged: string;
    shareLink: string;
    shareCopied: string;
    saveWatermark: string;
    regenerate: string;
    autoRetrying: string;
    payAlipayComingSoon: string;
    wechatScanQr: string;
  };
  manage: {
    title: string;
    subtitle: string;
    tabScenic: string;
    tabCostume: string;
    tabJewelry: string;
    tabHeadwear: string;
    tabMakeup: string;
    uploadImage: string;
    addScenic: string;
    scenicName: string;
    scenicProvince: string;
    scenicDesc: string;
    scenicStyle: string;
    scenicImage: string;
    scenicNamePh: string;
    scenicProvincePh: string;
    scenicDescPh: string;
    scenicStylePh: string;
    submitScenic: string;
    myScenic: string;
    systemScenic: string;
    addCostume: string;
    costumeName: string;
    costumeDynasty: string;
    costumeStyle: string;
    costumeCategory: string;
    costumeDesc: string;
    costumeImage: string;
    costumeNamePh: string;
    costumeDynastyPh: string;
    costumeStylePh: string;
    costumeDescPh: string;
    submitCostume: string;
    myCostume: string;
    systemCostume: string;
    catDress: string;
    catRobe: string;
    catJacket: string;
    catSkirt: string;
    addJewelry: string;
    jewelryName: string;
    jewelryCategory: string;
    jewelryDesc: string;
    jewelryImage: string;
    jewelryNamePh: string;
    jewelryDescPh: string;
    submitJewelry: string;
    myJewelry: string;
    systemJewelry: string;
    catNecklace: string;
    catBracelet: string;
    catEarring: string;
    catRing: string;
    catHairpin: string;
    addHeadwear: string;
    headwearName: string;
    headwearCategory: string;
    headwearDesc: string;
    headwearImage: string;
    headwearNamePh: string;
    headwearDescPh: string;
    submitHeadwear: string;
    myHeadwear: string;
    systemHeadwear: string;
    catCrown: string;
    catHwHairpin: string;
    catFlower: string;
    catVeil: string;
    catComb: string;
    addMakeup: string;
    makeupName: string;
    makeupStyle: string;
    makeupCategory: string;
    makeupDesc: string;
    makeupImage: string;
    makeupNamePh: string;
    makeupStylePh: string;
    makeupDescPh: string;
    submitMakeup: string;
    myMakeup: string;
    systemMakeup: string;
    catElegant: string;
    catNatural: string;
    catGlamorous: string;
    catEthereal: string;
  };
};

export const messages: Record<Locale, Messages> = {
  zh: {
    common: {
      brand: '华裳纪',
      brandEn: 'Huashangji',
      switchToZh: '中文',
      switchToEn: 'EN',
      language: '语言',
    },
    home: {
      manageTitle: '自定义管理',
      manageAria: '打开自定义管理页面',
      heroAria: '华裳纪古装搭配应用背景图',
      heroTagline: '穿越千年的美学之旅',
      heroSubtitle:
        '上传照片，AI 生成景区古装大片 · 首次免费',
      spotsHeading: '选择你的景区',
      spotsSubtitle: '每个景区都有独特的气质，等待与你相遇',
      spotsNavAria: '全国景区古装搭配场景',
      spotAria: '{name} - {style}风格古装搭配',
      spotImageAria: '{province}{name}景区场景',
      howHeading: '如何开始',
      step1Title: '选择景区',
      step1Desc: '从全国八大经典景区中选择你想体验的场景',
      step2Title: '搭配装扮',
      step2Desc: '选择服饰、首饰、头饰和妆容，打造专属造型',
      step3Title: '保存分享',
      step3Desc: 'AI 生成古装效果图，保存你的专属记忆',
      footerTagline: '穿越千年的美学之旅 · 全国景区古装搭配',
    },
    dressUp: {
      backHome: '返回首页',
      backHomeAria: '返回华裳纪首页',
      titleSuffix: '古装搭配',
      spotBgAria: '{province}{name}景区背景',
      spotMissing: '景区不存在',
      uploadPhoto: '上传照片',
      photoTypeAria: '照片类型',
      fullBody: '全身照',
      halfBody: '半身照',
      clickUpload: '点击上传{type}照片',
      fullBodyShort: '全身',
      halfBodyShort: '半身',
      photoHint: '支持 JPG、PNG 格式',
      photoPreviewAlt: '{name}古装搭配照片预览',
      resultTitle: '生成效果',
      resultAlt: '{name}{style}古装 AI 生成效果',
      saveImage: '保存图片',
      selectCostume: '选择服饰',
      selectJewelry: '选择首饰（可多选）',
      selectHeadwear: '选择头饰',
      selectMakeup: '选择妆容',
      generating: '正在生成...',
      generate: '生成古装效果',
      alertIncomplete: '请上传照片并选择服饰、头饰和妆容',
      alertFailed: '生成失败：',
      alertRetry: '生成失败，请重试',
      unknownError: '未知错误',
      downloadFallback: '古装',
    },
    seo: {
      guideTitle: '{name}古装搭配指南',
      styleGuide: '风格解读',
      outfitTips: '搭配建议',
      photoTips: '拍照与上传建议',
      faq: '常见问题',
      exploreMore: '探索更多景区',
      relatedNavAria: '其他景区古装搭配',
    },
    billing: {
      creditsLabel: '剩余 {n} 次',
      buyCredits: '购买次数',
      buyTitle: '购买生成次数',
      buyDesc: 'AI 古装生成按次计费，失败不扣次。',
      remaining: '当前可用 {n} 次。',
      featured: '主推',
      creditsUnit: '次',
      payWechat: '微信支付',
      payAlipay: '支付宝',
      payMock: '模拟支付（开发）',
      processing: '创建订单中…',
      waitingPay: '请在新窗口完成支付，成功后将自动到账。',
      checkoutFailed: '创建支付失败，请重试',
      needCredits: '生成次数不足，请先购买次数包',
      paidSuccess: '支付成功，次数已到账',
      firstPurchaseBanner: '限时首充立减 ¥{yuan}',
      firstPurchaseTag: '首充优惠',
      bindPhone: '绑定手机号',
      bindPhoneHint: '换设备也能找回次数；同号会自动合并钱包',
      phonePlaceholder: '11 位手机号',
      bindAction: '绑定',
      phoneBindSuccess: '手机号绑定成功',
      phoneBindFailed: '绑定失败，请检查手机号',
      phoneMerged: '已绑定并合并另一设备钱包',
      shareLink: '复制分享短链',
      shareCopied: '已复制景区短链',
      saveWatermark: '保存含水印图',
      regenerate: '再生成一次',
      autoRetrying: '支付成功，正在自动重新生成…',
      payAlipayComingSoon: '支付宝（敬请期待）',
      wechatScanQr: '微信扫码支付',
    },
    manage: {
      title: '自定义管理',
      subtitle: '添加你喜欢的场景和装扮',
      tabScenic: '场景',
      tabCostume: '服饰',
      tabJewelry: '首饰',
      tabHeadwear: '头饰',
      tabMakeup: '妆容',
      uploadImage: '点击上传图片',
      addScenic: '添加新场景',
      scenicName: '场景名称',
      scenicProvince: '所在省份',
      scenicDesc: '场景描述',
      scenicStyle: '风格定位',
      scenicImage: '场景图片',
      scenicNamePh: '如：九寨沟',
      scenicProvincePh: '如：四川',
      scenicDescPh: '描述这个场景的特色和氛围',
      scenicStylePh: '如：清新自然',
      submitScenic: '添加场景',
      myScenic: '我添加的场景',
      systemScenic: '系统预设场景',
      addCostume: '添加新服饰',
      costumeName: '服饰名称',
      costumeDynasty: '朝代',
      costumeStyle: '风格',
      costumeCategory: '类别',
      costumeDesc: '描述',
      costumeImage: '服饰图片',
      costumeNamePh: '如：齐胸襦裙',
      costumeDynastyPh: '如：唐',
      costumeStylePh: '如：华丽',
      costumeDescPh: '描述服饰特点',
      submitCostume: '添加服饰',
      myCostume: '我添加的服饰',
      systemCostume: '系统预设服饰',
      catDress: '裙装',
      catRobe: '袍服',
      catJacket: '上衣',
      catSkirt: '下裙',
      addJewelry: '添加新首饰',
      jewelryName: '首饰名称',
      jewelryCategory: '类别',
      jewelryDesc: '描述',
      jewelryImage: '首饰图片',
      jewelryNamePh: '如：玉簪',
      jewelryDescPh: '描述首饰特点',
      submitJewelry: '添加首饰',
      myJewelry: '我添加的首饰',
      systemJewelry: '系统预设首饰',
      catNecklace: '项链',
      catBracelet: '手镯',
      catEarring: '耳饰',
      catRing: '戒指',
      catHairpin: '发簪',
      addHeadwear: '添加新头饰',
      headwearName: '头饰名称',
      headwearCategory: '类别',
      headwearDesc: '描述',
      headwearImage: '头饰图片',
      headwearNamePh: '如：凤冠',
      headwearDescPh: '描述头饰特点',
      submitHeadwear: '添加头饰',
      myHeadwear: '我添加的头饰',
      systemHeadwear: '系统预设头饰',
      catCrown: '冠',
      catHwHairpin: '簪',
      catFlower: '花饰',
      catVeil: '面纱',
      catComb: '梳篦',
      addMakeup: '添加新妆容',
      makeupName: '妆容名称',
      makeupStyle: '风格',
      makeupCategory: '类别',
      makeupDesc: '描述',
      makeupImage: '妆容图片',
      makeupNamePh: '如：唐妆',
      makeupStylePh: '如：华丽',
      makeupDescPh: '描述妆容特点',
      submitMakeup: '添加妆容',
      myMakeup: '我添加的妆容',
      systemMakeup: '系统预设妆容',
      catElegant: '典雅',
      catNatural: '自然',
      catGlamorous: '华丽',
      catEthereal: '仙气',
    },
  },
  en: {
    common: {
      brand: '华裳纪',
      brandEn: 'Huashangji',
      switchToZh: '中文',
      switchToEn: 'EN',
      language: 'Language',
    },
    home: {
      manageTitle: 'Custom Manager',
      manageAria: 'Open custom management page',
      heroAria: 'Huashangji traditional costume styling background',
      heroTagline: 'An aesthetic journey across a thousand years',
      heroSubtitle:
        'Upload a photo and generate scenic costume portraits with AI · First try free',
      spotsHeading: 'Choose Your Scenic Spot',
      spotsSubtitle: 'Every place has a unique mood waiting to meet you',
      spotsNavAria: 'Scenic spots for traditional costume styling',
      spotAria: '{name} - {style} traditional costume styling',
      spotImageAria: '{name} scenic scene in {province}',
      howHeading: 'How to Start',
      step1Title: 'Pick a Spot',
      step1Desc: 'Choose from eight classic scenic destinations across China',
      step2Title: 'Style Your Look',
      step2Desc: 'Select costume, jewelry, headwear, and makeup',
      step3Title: 'Save & Share',
      step3Desc: 'Generate an AI costume portrait and keep your memory',
      footerTagline:
        'An aesthetic journey across a thousand years · Scenic costume styling',
    },
    dressUp: {
      backHome: 'Back Home',
      backHomeAria: 'Back to Huashangji home',
      titleSuffix: 'Costume Styling',
      spotBgAria: '{name} scenic background in {province}',
      spotMissing: 'Scenic spot not found',
      uploadPhoto: 'Upload Photo',
      photoTypeAria: 'Photo type',
      fullBody: 'Full body',
      halfBody: 'Half body',
      clickUpload: 'Click to upload a {type} photo',
      fullBodyShort: 'full-body',
      halfBodyShort: 'half-body',
      photoHint: 'JPG and PNG supported',
      photoPreviewAlt: '{name} costume photo preview',
      resultTitle: 'Generated Result',
      resultAlt: 'AI-generated {style} costume look for {name}',
      saveImage: 'Save Image',
      selectCostume: 'Choose Costume',
      selectJewelry: 'Choose Jewelry (multi-select)',
      selectHeadwear: 'Choose Headwear',
      selectMakeup: 'Choose Makeup',
      generating: 'Generating...',
      generate: 'Generate Costume Look',
      alertIncomplete:
        'Please upload a photo and select costume, headwear, and makeup',
      alertFailed: 'Generation failed: ',
      alertRetry: 'Generation failed. Please try again.',
      unknownError: 'Unknown error',
      downloadFallback: 'costume',
    },
    seo: {
      guideTitle: '{name} Costume Styling Guide',
      styleGuide: 'Style Guide',
      outfitTips: 'Outfit Tips',
      photoTips: 'Photo & Upload Tips',
      faq: 'FAQ',
      exploreMore: 'Explore More Spots',
      relatedNavAria: 'Other scenic costume styling pages',
    },
    billing: {
      creditsLabel: '{n} left',
      buyCredits: 'Buy credits',
      buyTitle: 'Buy generation credits',
      buyDesc: 'Pay per AI generation. Failed runs are not charged.',
      remaining: 'You have {n} available.',
      featured: 'Best',
      creditsUnit: 'credits',
      payWechat: 'WeChat Pay',
      payAlipay: 'Alipay',
      payMock: 'Mock pay (dev)',
      processing: 'Creating order…',
      waitingPay: 'Complete payment in the new window. Credits unlock automatically.',
      checkoutFailed: 'Checkout failed. Please try again.',
      needCredits: 'Not enough credits. Please buy a pack.',
      paidSuccess: 'Payment successful. Credits added.',
      firstPurchaseBanner: 'First-purchase discount ¥{yuan}',
      firstPurchaseTag: 'First deal',
      bindPhone: 'Bind phone',
      bindPhoneHint: 'Keep credits across devices; same number merges wallets',
      phonePlaceholder: '11-digit mobile',
      bindAction: 'Bind',
      phoneBindSuccess: 'Phone bound',
      phoneBindFailed: 'Bind failed. Check the number.',
      phoneMerged: 'Bound and merged another device wallet',
      shareLink: 'Copy short link',
      shareCopied: 'Scenic short link copied',
      saveWatermark: 'Save with watermark',
      regenerate: 'Generate again',
      autoRetrying: 'Paid. Auto-retrying generation…',
      payAlipayComingSoon: 'Alipay (coming soon)',
      wechatScanQr: 'Scan with WeChat to pay',
    },
    manage: {
      title: 'Custom Manager',
      subtitle: 'Add your favorite scenes and outfits',
      tabScenic: 'Scenes',
      tabCostume: 'Costumes',
      tabJewelry: 'Jewelry',
      tabHeadwear: 'Headwear',
      tabMakeup: 'Makeup',
      uploadImage: 'Click to upload image',
      addScenic: 'Add New Scene',
      scenicName: 'Scene Name',
      scenicProvince: 'Province',
      scenicDesc: 'Description',
      scenicStyle: 'Style',
      scenicImage: 'Scene Image',
      scenicNamePh: 'e.g. Jiuzhaigou',
      scenicProvincePh: 'e.g. Sichuan',
      scenicDescPh: 'Describe the mood and atmosphere',
      scenicStylePh: 'e.g. Fresh & natural',
      submitScenic: 'Add Scene',
      myScenic: 'My Scenes',
      systemScenic: 'System Scenes',
      addCostume: 'Add New Costume',
      costumeName: 'Costume Name',
      costumeDynasty: 'Dynasty',
      costumeStyle: 'Style',
      costumeCategory: 'Category',
      costumeDesc: 'Description',
      costumeImage: 'Costume Image',
      costumeNamePh: 'e.g. Qixiong Ruqun',
      costumeDynastyPh: 'e.g. Tang',
      costumeStylePh: 'e.g. Elegant',
      costumeDescPh: 'Describe the costume',
      submitCostume: 'Add Costume',
      myCostume: 'My Costumes',
      systemCostume: 'System Costumes',
      catDress: 'Dress',
      catRobe: 'Robe',
      catJacket: 'Jacket',
      catSkirt: 'Skirt',
      addJewelry: 'Add New Jewelry',
      jewelryName: 'Jewelry Name',
      jewelryCategory: 'Category',
      jewelryDesc: 'Description',
      jewelryImage: 'Jewelry Image',
      jewelryNamePh: 'e.g. Jade hairpin',
      jewelryDescPh: 'Describe the jewelry',
      submitJewelry: 'Add Jewelry',
      myJewelry: 'My Jewelry',
      systemJewelry: 'System Jewelry',
      catNecklace: 'Necklace',
      catBracelet: 'Bracelet',
      catEarring: 'Earring',
      catRing: 'Ring',
      catHairpin: 'Hairpin',
      addHeadwear: 'Add New Headwear',
      headwearName: 'Headwear Name',
      headwearCategory: 'Category',
      headwearDesc: 'Description',
      headwearImage: 'Headwear Image',
      headwearNamePh: 'e.g. Phoenix crown',
      headwearDescPh: 'Describe the headwear',
      submitHeadwear: 'Add Headwear',
      myHeadwear: 'My Headwear',
      systemHeadwear: 'System Headwear',
      catCrown: 'Crown',
      catHwHairpin: 'Hairpin',
      catFlower: 'Flower',
      catVeil: 'Veil',
      catComb: 'Comb',
      addMakeup: 'Add New Makeup',
      makeupName: 'Makeup Name',
      makeupStyle: 'Style',
      makeupCategory: 'Category',
      makeupDesc: 'Description',
      makeupImage: 'Makeup Image',
      makeupNamePh: 'e.g. Tang makeup',
      makeupStylePh: 'e.g. Glamorous',
      makeupDescPh: 'Describe the makeup',
      submitMakeup: 'Add Makeup',
      myMakeup: 'My Makeup',
      systemMakeup: 'System Makeup',
      catElegant: 'Elegant',
      catNatural: 'Natural',
      catGlamorous: 'Glamorous',
      catEthereal: 'Ethereal',
    },
  },
};

export function formatMessage(
  template: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
