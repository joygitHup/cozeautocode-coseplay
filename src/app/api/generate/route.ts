import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import {
  getScenicSpotById,
  getCostumeById,
  getJewelryById,
  getHeadwearById,
  getMakeupById,
} from '@/lib/data';
import type { Jewelry } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      photoBase64,
      photoType,
      costumeId,
      jewelryIds = [],
      headwearId,
      makeupId,
      scenicSpotId,
    } = body;

    // 验证必填参数
    if (!photoBase64 || !costumeId || !headwearId || !makeupId || !scenicSpotId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取数据
    const scenicSpot = getScenicSpotById(scenicSpotId);
    const costume = getCostumeById(costumeId);
    const headwear = getHeadwearById(headwearId);
    const makeup = getMakeupById(makeupId);

    if (!scenicSpot || !costume || !headwear || !makeup) {
      return NextResponse.json(
        { error: '未找到对应的景区或装扮数据' },
        { status: 400 }
      );
    }

    // 获取首饰信息
    const jewelryItems: Jewelry[] = jewelryIds
      .map((id: string) => getJewelryById(id))
      .filter((j: Jewelry | undefined): j is Jewelry => j !== undefined);

    // 构建详细的 prompt
    const photoTypeDesc = photoType === 'full-body' ? '全身照' : '半身照';
    const jewelryDesc = jewelryItems.length > 0
      ? jewelryItems.map((j: Jewelry) => j.name).join('、')
      : '无额外首饰';

    const prompt = `请将这张${photoTypeDesc}中的人物变换为古装造型，要求如下：

【场景背景】
景区：${scenicSpot.name}（${scenicSpot.province}）
风格：${scenicSpot.style}
场景描述：${scenicSpot.description}

【服饰要求】
朝代：${costume.dynasty}代
服饰名称：${costume.name}
服饰描述：${costume.description}

【头饰要求】
头饰名称：${headwear.name}
头饰描述：${headwear.description}

【首饰要求】
${jewelryDesc}

【妆容要求】
妆容名称：${makeup.name}
妆容描述：${makeup.description}

【技术要求】
1. 保持人物面部特征不变，只改变服装和造型
2. 背景要体现${scenicSpot.name}的特色景观
3. 整体风格要协调统一，符合${scenicSpot.style}的美学
4. 画面质量要高，细节要精致
5. 光线和阴影要自然真实`;

    // 初始化 SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new ImageGenerationClient(config, customHeaders);

    // 将 base64 图片转换为 data URL 格式
    const imageDataUrl = photoBase64.startsWith('data:')
      ? photoBase64
      : `data:image/jpeg;base64,${photoBase64}`;

    // 调用图像生成 API
    const response = await client.generate({
      prompt,
      image: imageDataUrl,
      size: '2K',
    });

    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrl: helper.imageUrls[0],
      });
    } else {
      return NextResponse.json(
        { error: helper.errorMessages.join(', ') || '图像生成失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('图像生成 API 错误:', error);
    
    // 处理不同的错误类型
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      if (statusCode === 402) {
        return NextResponse.json(
          { error: '图像生成服务暂不可用，请稍后重试' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
