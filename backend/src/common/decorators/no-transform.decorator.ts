import { SetMetadata } from '@nestjs/common';

export const NO_TRANSFORM_KEY = 'noTransform';

/**
 * Bu decorator ile işaretlenen controller/handler'ların yanıtları
 * TransformInterceptor tarafından { success, data } zarfına sarılmaz.
 * Health check gibi dış servislerin (Render, UptimeRobot) beklediği
 * sabit formatta yanıt dönmesi gereken endpoint'ler için kullanılır.
 */
export const NoTransform = () => SetMetadata(NO_TRANSFORM_KEY, true);
