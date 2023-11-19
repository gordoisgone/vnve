import { FrameTicker } from "./FrameTicker";
import { ICreatorTickCtx } from ".";
import { wait } from "../Utils";

interface IPreviewerOptions {
  container: HTMLCanvasElement;
  duration: number;
  fps: number;
  ticker: FrameTicker<ICreatorTickCtx>;
}

export class Previewer {
  public container: HTMLCanvasElement;
  public duration: number;
  public fps: number;
  public ticker: FrameTicker<ICreatorTickCtx>;
  public active: boolean;

  constructor(options: IPreviewerOptions) {
    this.container = options.container;
    this.duration = options.duration;
    this.fps = options.fps;
    this.ticker = options.ticker;
    this.active = false;
    this.createPreviewTickInterceptor();
  }

  private createPreviewTickInterceptor() {
    this.ticker.interceptor.beforeAll(async (tickCtx) => {
      if (!this.active) {
        return;
      }

      tickCtx.previewerAudioContext = new AudioContext();
      tickCtx.previewerAudioBufferSourceNodes = [];
    });
    this.ticker.interceptor.afterAll(async (tickCtx) => {
      if (!this.active) {
        return;
      }

      if (tickCtx.previewerAudioContext) {
        tickCtx.previewerAudioBufferSourceNodes?.forEach((item) => {
          item.disconnect();
        });
        tickCtx.previewerAudioBufferSourceNodes = [];
        tickCtx.previewerAudioContext.close();
        tickCtx.previewerAudioContext = undefined;
      }
    });
    this.ticker.interceptor.before(async (_timestamp, tickCtx) => {
      if (!this.active) {
        return;
      }

      tickCtx.tickStartTime = Date.now();
    });
    this.ticker.interceptor.after(async (timestamp, tickCtx) => {
      if (!this.active) {
        return;
      }

      if (
        tickCtx.tickStartTime &&
        tickCtx.imageSource &&
        timestamp <= this.duration
      ) {
        const bitmap = (tickCtx.imageSource as any).transferToImageBitmap();

        this.container
          .getContext("bitmaprenderer")
          ?.transferFromImageBitmap(bitmap);
        const frameDuration = 1000 / this.fps;

        const remainingFrameTime =
          frameDuration - (Date.now() - tickCtx.tickStartTime);

        if (remainingFrameTime > 0) {
          await wait(remainingFrameTime);
        }
      }
    });
  }

  public async start(duration?: number) {
    if (duration) {
      this.duration = duration;
    }

    this.active = true;
    await this.ticker.run(this.duration, this.fps).finally(() => {
      this.active = false;
    });
  }

  public stop() {
    this.active = false;
    this.ticker.stop();
  }
}
