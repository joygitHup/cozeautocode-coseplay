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
import { attachGuestCookie, resolveGuestId } from '@/lib/billing/guest';
import {
  appendGenerationLog,
  availableCredits,
  hashImagePayload,
  reserveGenerationCredit,
  rollbackGenerationCredit,
} from '@/lib/billing/store';
import { checkGenerationRateLimit } from '@/lib/billing/rate-limit';

function readFingerprint(request: NextRequest, body: unknown): string | null {
  const header = request.headers.get('x-device-fp');
  if (header && header.length >= 8) return header.slice(0, 128);
  if (
    body &&
    typeof body === 'object' &&
    'deviceFingerprint' in body &&
    typeof (body as { deviceFingerprint: unknown }).deviceFingerprint ===
      'string'
  ) {
    return (body as { deviceFingerprint: string }).deviceFingerprint.slice(
      0,
      128,
    );
  }
  return null;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const { guestId, isNew } = resolveGuestId(request);
  let reserved: Awaited<ReturnType<typeof reserveGenerationCredit>> | null =
    null;
  let deviceFingerprint: string | null = null;
  let imageHash: string | null = null;

  try {
    const body = await request.json();
    deviceFingerprint = readFingerprint(request, body);

    const {
      photoBase64,
      photoType,
      costumeId,
      jewelryIds = [],
      headwearId,
      makeupId,
      spotId,
    } = body;

    if (!photoBase64 || !costumeId || !headwearId || !makeupId || !spotId) {
      const response = NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    if (!photoBase64.startsWith('data:image/')) {
      const response = NextResponse.json(
        { error: '照片格式不正确，请上传有效的图片' },
        { status: 400 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    const base64Data = photoBase64.split(',')[1];
    if (!base64Data || base64Data.length < 100) {
      const response = NextResponse.json(
        { error: '照片数据无效或太短，请上传完整的图片' },
        { status: 400 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    imageHash = hashImagePayload(photoBase64);
    const rate = checkGenerationRateLimit(guestId, request, imageHash);
    if (!rate.ok) {
      const message =
        rate.reason === 'image'
          ? '同一照片请求过于频繁，请更换照片或稍后再试'
          : '请求过于频繁，请稍后再试';
      const response = NextResponse.json(
        { error: message, code: 'RATE_LIMITED', reason: rate.reason },
        { status: 429 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    const scenicSpot = getScenicSpotById(spotId);
    const costume = getCostumeById(costumeId);
    const headwear = getHeadwearById(headwearId);
    const makeup = getMakeupById(makeupId);

    if (!scenicSpot || !costume || !headwear || !makeup) {
      const response = NextResponse.json(
        { error: '未找到对应的景区或装扮数据' },
        { status: 400 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    const siliconflowKey = process.env.SILICONFLOW_API_KEY;
    const cozeConfig = new Config();
    if (!siliconflowKey && (!cozeConfig.baseUrl || !cozeConfig.apiKey)) {
      const response = NextResponse.json(
        {
          error:
            '生成服务未配置：请在 .env.local 中配置 SILICONFLOW_API_KEY（或 Coze 凭证 COZE_INTEGRATION_BASE_URL / COZE_WORKLOAD_IDENTITY_API_KEY）',
        },
        { status: 503 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    reserved = await reserveGenerationCredit(guestId, deviceFingerprint);
    if (!reserved.ok) {
      const response = NextResponse.json(
        {
          error: '生成次数不足，请购买次数包',
          code: 'NEED_CREDITS',
          credits: availableCredits(reserved.wallet),
        },
        { status: 402 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    const jewelryItems: Jewelry[] = jewelryIds
      .map((id: string) => getJewelryById(id))
      .filter((j: Jewelry | undefined): j is Jewelry => j !== undefined);

    const photoTypeDesc = photoType === 'full-body' ? '全身照' : '半身照';
    const jewelryDesc =
      jewelryItems.length > 0
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

    const imageDataUrl = photoBase64.startsWith('data:')
      ? photoBase64
      : `data:image/jpeg;base64,${photoBase64}`;

    // 优先 SiliconFlow（配置了 SILICONFLOW_API_KEY 时），否则回退 coze-coding-dev-sdk
    let genOk = false;
    let genImageUrl: string | null = null;
    let genErr = '';

    if (siliconflowKey) {
      try {
        const sfRes = await fetch(
          'https://api.siliconflow.cn/v1/images/generations',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${siliconflowKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model:
                process.env.SILICONFLOW_IMAGE_MODEL || 'Kwai-Kolors/Kolors',
              prompt,
              image: imageDataUrl,
              image_size: photoType === 'full-body' ? '720x1280' : '960x1280',
              batch_size: 1,
            }),
            signal: AbortSignal.timeout(120000),
          },
        );
        const sfData = (await sfRes.json()) as {
          images?: { url: string }[];
          message?: string;
        };
        if (sfRes.ok && sfData.images?.[0]?.url) {
          genOk = true;
          genImageUrl = sfData.images[0].url;
        } else {
          genErr = sfData.message || `SiliconFlow HTTP ${sfRes.status}`;
        }
      } catch (sfErr) {
        genErr =
          sfErr instanceof Error ? sfErr.message : 'SiliconFlow 请求失败';
      }
    } else {
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const client = new ImageGenerationClient(cozeConfig, customHeaders);
      const genResponse = await client.generate({
        prompt,
        image: imageDataUrl,
        size: '2K',
      });
      const helper = client.getResponseHelper(genResponse);
      if (helper.success && helper.imageUrls.length > 0) {
        genOk = true;
        genImageUrl = helper.imageUrls[0];
      } else {
        genErr = helper.errorMessages.join(', ') || '图像生成失败';
      }
    }

    const durationMs = Date.now() - startedAt;

    if (genOk && genImageUrl) {
      await appendGenerationLog({
        guestId,
        scenicSpotId: spotId,
        success: true,
        usedFree: reserved.usedFree,
        creditsBefore: reserved.creditsBefore,
        creditsAfter: reserved.wallet.credits,
        durationMs,
        errorMessage: null,
        imageHash,
      });

      const json = NextResponse.json({
        success: true,
        imageUrl: genImageUrl,
        credits: availableCredits(reserved.wallet),
        usedFree: reserved.usedFree,
      });
      if (isNew) attachGuestCookie(json, guestId);
      return json;
    }

    const errMsg = genErr || '图像生成失败';
    const rolled = await rollbackGenerationCredit(
      guestId,
      reserved.usedFree,
      deviceFingerprint,
    );
    await appendGenerationLog({
      guestId,
      scenicSpotId: spotId,
      success: false,
      usedFree: reserved.usedFree,
      creditsBefore: reserved.creditsBefore,
      creditsAfter: rolled.credits,
      durationMs,
      errorMessage: errMsg,
      imageHash,
    });

    const failResponse = NextResponse.json({ error: errMsg }, { status: 500 });
    if (isNew) attachGuestCookie(failResponse, guestId);
    return failResponse;
  } catch (error) {
    console.error('图像生成 API 错误:', error);

    if (reserved?.ok) {
      try {
        const rolled = await rollbackGenerationCredit(
          guestId,
          reserved.usedFree,
          deviceFingerprint,
        );
        await appendGenerationLog({
          guestId,
          scenicSpotId: null,
          success: false,
          usedFree: reserved.usedFree,
          creditsBefore: reserved.creditsBefore,
          creditsAfter: rolled.credits,
          durationMs: Date.now() - startedAt,
          errorMessage:
            error instanceof Error ? error.message : 'Internal error',
          imageHash,
        });
      } catch (rollbackError) {
        console.error('回滚次数失败:', rollbackError);
      }
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      if (statusCode === 402) {
        const response = NextResponse.json(
          { error: '图像生成服务暂不可用，请稍后重试' },
          { status: 503 },
        );
        if (isNew) attachGuestCookie(response, guestId);
        return response;
      }
      if (statusCode === 400) {
        const response = NextResponse.json(
          {
            error:
              '照片格式或内容不正确，请重新上传清晰的全身或半身照片',
          },
          { status: 400 },
        );
        if (isNew) attachGuestCookie(response, guestId);
        return response;
      }
    }

    const response = NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 },
    );
    if (isNew) attachGuestCookie(response, guestId);
    return response;
  }
}
