import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs-backend-webgl";
import { Color } from "@tensorflow-models/body-pix/dist/types";

export async function loadAndUseBodypix(multiplier?: 1 | 0.75 | 0.5) {
  const outputStride = 16;
  return await bodyPix.load({
    multiplier,
    outputStride,
    architecture: "MobileNetV1",
  });
}

// given a video element
export async function segmentPerson(
  net: bodyPix.BodyPix,
  video: HTMLVideoElement
) {
  const segmentationThreshold = 0.5;

  const personSegmentation = await net.segmentPerson(video, {
    scoreThreshold: segmentationThreshold,
    maxDetections: 1,
  });
  return personSegmentation;
}

const WHITE: Color = { r: 255, g: 255, b: 255, a: 255 };
const BLACK: Color = { r: 0, g: 0, b: 0, a: 255 };

export function getSegmentationImage(
  segmentation: bodyPix.SemanticPersonSegmentation
) {
  return bodyPix.toMask(segmentation, WHITE, BLACK);
}

export function drawSegmentation(
  ctx: CanvasRenderingContext2D,
  segmentation: bodyPix.SemanticPersonSegmentation
) {
  const imgData = getSegmentationImage(segmentation);
  ctx.putImageData(imgData, 0, 0);
}
