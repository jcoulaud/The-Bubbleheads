import { Position } from '../types';

interface RenderConfig {
  canvas: HTMLCanvasElement;
  userImage: string;
  helmetPosition: Position;
  helmetScale: number;
  useBackground: boolean;
  isPreview?: boolean;
}

export async function renderHelmetImage(config: RenderConfig): Promise<void> {
  const {
    canvas,
    userImage,
    helmetPosition,
    helmetScale,
    useBackground,
    isPreview = false,
  } = config;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const userImg = new Image();
  userImg.src = userImage;

  await new Promise<void>((resolve, reject) => {
    userImg.onload = () => resolve();
    userImg.onerror = () => reject(new Error('Failed to load user image'));
  });

  const helmetImg = new Image();
  helmetImg.src = '/helmet.png';

  await new Promise<void>((resolve, reject) => {
    helmetImg.onload = () => resolve();
    helmetImg.onerror = () => reject(new Error('Failed to load helmet image'));
  });

  let bgImg: HTMLImageElement | null = null;
  if (useBackground) {
    bgImg = new Image();
    bgImg.src = '/space-background.jpg';
    await new Promise<void>((resolve) => {
      bgImg!.onload = () => resolve();
    });
  }

  if (isPreview) {
    const containerSize = canvas.width;
    
    // Clear the canvas first
    ctx.clearRect(0, 0, containerSize, containerSize);
    
    const scale = Math.min(containerSize / userImg.width, containerSize / userImg.height);
    const scaledWidth = userImg.width * scale;
    const scaledHeight = userImg.height * scale;
    const offsetX = (containerSize - scaledWidth) / 2;
    const offsetY = (containerSize - scaledHeight) / 2;

    const helmetWidth = containerSize * helmetScale * 0.5;
    const helmetHeight = (helmetImg.height / helmetImg.width) * helmetWidth;
    const helmetX = containerSize * helmetPosition.x - helmetWidth / 2;
    const helmetY = containerSize * helmetPosition.y - helmetHeight / 2;

    if (useBackground && bgImg) {
      ctx.drawImage(bgImg, 0, 0, containerSize, containerSize);

      ctx.save();
      const visorCenterX = helmetX + helmetWidth * 0.533;
      const visorCenterY = helmetY + helmetHeight * 0.5;
      const visorRadius = helmetWidth * 0.37;

      ctx.beginPath();
      ctx.arc(visorCenterX, visorCenterY, visorRadius, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(userImg, offsetX, offsetY, scaledWidth, scaledHeight);
      ctx.restore();
    } else {
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, containerSize, containerSize);
      ctx.drawImage(userImg, offsetX, offsetY, scaledWidth, scaledHeight);
    }

    ctx.drawImage(helmetImg, helmetX, helmetY, helmetWidth, helmetHeight);
  } else {
    canvas.width = userImg.width;
    canvas.height = userImg.height;

    const helmetWidth = canvas.width * helmetScale * 0.5;
    const helmetHeight = (helmetImg.height / helmetImg.width) * helmetWidth;
    const helmetX = canvas.width * helmetPosition.x - helmetWidth / 2;
    const helmetY = canvas.height * helmetPosition.y - helmetHeight / 2;

    if (useBackground && bgImg) {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      ctx.save();
      const visorCenterX = helmetX + helmetWidth * 0.533;
      const visorCenterY = helmetY + helmetHeight * 0.5;
      const visorRadius = helmetWidth * 0.37;

      ctx.beginPath();
      ctx.arc(visorCenterX, visorCenterY, visorRadius, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(userImg, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(userImg, 0, 0);
    }

    ctx.drawImage(helmetImg, helmetX, helmetY, helmetWidth, helmetHeight);
  }
}
