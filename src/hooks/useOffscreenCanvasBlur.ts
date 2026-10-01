import { useLayoutEffect, useMemo, useRef } from '../lib/teact/teact';

import fastBlur from '../lib/fastBlur';
import { requestMutation } from '../lib/fasterdom/fasterdom';
import cycleRestrict from '../util/cycleRestrict';
import { preloadImage } from '../util/files';
import { MAX_WORKERS, requestMediaWorker } from '../util/launchMediaWorkers';
import useLastCallback from './useLastCallback';

const RADIUS_RATIO = 0.1; // Use 10% of the smallest dimension as the blur radius
const FAST_BLUR_ITERATIONS = 2;
// Safari < 16.4 (iOS 15) has no `transferControlToOffscreen`, blur on the main thread instead
const IS_OFFSCREEN_TRANSFER_SUPPORTED = typeof HTMLCanvasElement !== 'undefined'
  && 'transferControlToOffscreen' in HTMLCanvasElement.prototype;

let lastWorkerIndex = -1;

export default function useOffscreenCanvasBlur(
  thumbData?: string, // data URI or blob URL
  isDisabled = false,
) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const workerIndex = useMemo(() => cycleRestrict(MAX_WORKERS, ++lastWorkerIndex), []);
  const offscreenRef = useRef<OffscreenCanvas>();

  const blurThumb = useLastCallback(async (canvas: HTMLCanvasElement, uri: string) => {
    const image = await preloadImage(uri);
    if (!image) {
      return;
    }

    requestMutation(() => {
      canvas.width = image.width;
      canvas.height = image.height;

      const radius = Math.ceil(Math.min(image.width, image.height) * RADIUS_RATIO);

      if (!IS_OFFSCREEN_TRANSFER_SUPPORTED) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(image, -radius * 2, -radius * 2, image.width + radius * 4, image.height + radius * 4);
        fastBlur(ctx, 0, 0, image.width, image.height, radius, FAST_BLUR_ITERATIONS);
        return;
      }

      offscreenRef.current = canvas.transferControlToOffscreen();

      requestMediaWorker({
        name: 'offscreen-canvas:blurThumb',
        args: [offscreenRef.current, uri, radius],
        transferables: [offscreenRef.current],
      }, workerIndex);
    });
  });

  useLayoutEffect(() => {
    if (!thumbData || isDisabled || offscreenRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    blurThumb(canvas, thumbData);
  }, [blurThumb, isDisabled, thumbData]);

  return canvasRef;
}
