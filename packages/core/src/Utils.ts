import {
  DEFAULT_AUDIO_CONFIG,
  DEFAULT_HEIGHT,
  DEFAULT_VIDEO_CONFIG,
  DEFAULT_WIDTH,
} from "./Const";

export async function sliceAudioBuffer(
  audioBuffer: AudioBuffer,
  timestamp: number,
  fps: number,
  volume?: number,
) {
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const startOffset = Math.floor((timestamp / 1000) * sampleRate);
  const numberOfFrames = sampleRate * (1 / fps);
  const offlineAudioContext = new OfflineAudioContext(
    numberOfChannels,
    numberOfFrames,
    sampleRate,
  );
  let audioBufferSlice: AudioBuffer = offlineAudioContext.createBuffer(
    numberOfChannels,
    numberOfFrames,
    sampleRate,
  );

  const f32ArraySlice = new Float32Array(numberOfFrames);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    audioBuffer.copyFromChannel(f32ArraySlice, channel, startOffset);
    audioBufferSlice.copyToChannel(f32ArraySlice, channel);
  }

  if (typeof volume !== "undefined") {
    const sourceNode = offlineAudioContext.createBufferSource();
    sourceNode.buffer = audioBufferSlice;
    const gainNode = offlineAudioContext.createGain();

    gainNode.gain.value = volume;
    sourceNode.connect(gainNode);
    gainNode.connect(offlineAudioContext.destination);
    sourceNode.start();
    audioBufferSlice = await offlineAudioContext.startRendering();
  }

  return audioBufferSlice;
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function arrayBufferToAudioBuffer(
  arrayBuffer: ArrayBuffer,
  sampleRate = 44100,
): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext({
      sampleRate,
    });

    audioContext.decodeAudioData(arrayBuffer, resolve, reject).finally(() => {
      audioContext.close();
    });
  });
}

export async function fetchUrlToAudiBuffer(url: string) {
  const arrayBuffer = await (await fetch(url)).arrayBuffer();

  const data = await arrayBufferToAudioBuffer(arrayBuffer);

  return data;
}

export class Converter {
  private static baseWidth = DEFAULT_WIDTH;
  private static baseHeight = DEFAULT_HEIGHT;
  private static widthScale = 1;
  private static heightScale = 1;

  public static set(width: number, height: number) {
    this.widthScale = width / this.baseWidth;
    this.heightScale = height / this.baseHeight;
  }
  public static width(width: number) {
    return this.widthScale * width;
  }
  public static height(height: number) {
    return this.heightScale * height;
  }
  public static x(x: number) {
    return this.widthScale * x;
  }
  public static y(y: number) {
    return this.heightScale * y;
  }
  public static fontSize(fontSize: number) {
    return this.widthScale * fontSize;
  }
}

export async function isEnvSupported() {
  if (
    typeof OfflineAudioContext === "undefined" ||
    typeof VideoEncoder === "undefined" ||
    typeof VideoFrame === "undefined" ||
    typeof AudioEncoder === "undefined" ||
    typeof AudioData === "undefined"
  ) {
    return false;
  }

  if (!(await VideoEncoder.isConfigSupported(DEFAULT_VIDEO_CONFIG)).supported) {
    return false;
  }

  if (!(await AudioEncoder.isConfigSupported(DEFAULT_AUDIO_CONFIG)).supported) {
    return false;
  }

  return true;
}
