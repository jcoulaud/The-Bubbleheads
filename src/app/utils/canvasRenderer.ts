import { Position } from '../types';

function applyPerspectiveTransform(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  perspectiveX: number,
  perspectiveY: number,
) {
  // Convert perspective values from -50 to 50 range to transformation coefficients
  const perspX = perspectiveX / 200; // Results in -0.25 to 0.25
  const perspY = perspectiveY / 200;

  // Calculate the four corner points with perspective distortion
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Top-left, top-right, bottom-right, bottom-left corners
  const corners = [
    { x: -halfWidth * (1 - perspX), y: -halfHeight * (1 - perspY) }, // TL
    { x: halfWidth * (1 + perspX), y: -halfHeight * (1 + perspY) }, // TR
    { x: halfWidth * (1 + perspX), y: halfHeight * (1 - perspY) }, // BR
    { x: -halfWidth * (1 - perspX), y: halfHeight * (1 + perspY) }, // BL
  ];

  return corners;
}

interface RenderConfig {
  canvas: HTMLCanvasElement;
  userImage: string;
  helmetPosition: Position;
  helmetScale: number;
  useBackground: boolean;
  userImagePosition?: Position;
  userImageScale?: number;
  userImageRotation?: number;
  userImageFlipped?: boolean;
  userImagePerspectiveX?: number;
  userImagePerspectiveY?: number;
  isPreview?: boolean;
  isDarkMode?: boolean;
}

export async function renderHelmetImage(config: RenderConfig): Promise<void> {
  const {
    canvas,
    userImage,
    helmetPosition,
    helmetScale,
    useBackground,
    userImagePosition = { x: 0.5, y: 0.5 },
    userImageScale = 1,
    userImageRotation = 0,
    userImageFlipped = false,
    userImagePerspectiveX = 0,
    userImagePerspectiveY = 0,
    isPreview = false,
    isDarkMode = false,
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

    const scale =
      Math.min(containerSize / userImg.width, containerSize / userImg.height) * userImageScale;
    const scaledWidth = userImg.width * scale;
    const scaledHeight = userImg.height * scale;
    const centerX = containerSize * userImagePosition.x;
    const centerY = containerSize * userImagePosition.y;

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

      // Apply user image transformations with perspective
      ctx.save();
      ctx.translate(centerX, centerY);
      if (userImageFlipped) {
        ctx.scale(-1, 1);
      }
      ctx.rotate((userImageRotation * Math.PI) / 180);

      // Apply perspective transformation
      if (userImagePerspectiveX !== 0 || userImagePerspectiveY !== 0) {
        const matrix = new DOMMatrix();
        matrix.a = 1 + userImagePerspectiveX / 100;
        matrix.b = userImagePerspectiveY / 200;
        matrix.c = userImagePerspectiveX / 200;
        matrix.d = 1 + userImagePerspectiveY / 100;
        ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
      }

      ctx.drawImage(userImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();

      ctx.restore();
    } else {
      // Use dark background in dark mode, light background in light mode
      ctx.fillStyle = isDarkMode ? '#374151' : '#f9fafb';
      ctx.fillRect(0, 0, containerSize, containerSize);

      // Apply user image transformations with perspective
      ctx.save();
      ctx.translate(centerX, centerY);
      if (userImageFlipped) {
        ctx.scale(-1, 1);
      }
      ctx.rotate((userImageRotation * Math.PI) / 180);

      // Apply perspective transformation
      if (userImagePerspectiveX !== 0 || userImagePerspectiveY !== 0) {
        const matrix = new DOMMatrix();
        matrix.a = 1 + userImagePerspectiveX / 100;
        matrix.b = userImagePerspectiveY / 200;
        matrix.c = userImagePerspectiveX / 200;
        matrix.d = 1 + userImagePerspectiveY / 100;
        ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
      }

      ctx.drawImage(userImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();
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

      // Apply user image transformations for final export with perspective
      ctx.save();
      const centerX = canvas.width * userImagePosition.x;
      const centerY = canvas.height * userImagePosition.y;
      const scaledWidth = userImg.width * userImageScale;
      const scaledHeight = userImg.height * userImageScale;

      ctx.translate(centerX, centerY);
      if (userImageFlipped) {
        ctx.scale(-1, 1);
      }
      ctx.rotate((userImageRotation * Math.PI) / 180);

      // Apply perspective transformation
      if (userImagePerspectiveX !== 0 || userImagePerspectiveY !== 0) {
        const matrix = new DOMMatrix();
        matrix.a = 1 + userImagePerspectiveX / 100;
        matrix.b = userImagePerspectiveY / 200;
        matrix.c = userImagePerspectiveX / 200;
        matrix.d = 1 + userImagePerspectiveY / 100;
        ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
      }

      ctx.drawImage(userImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();

      ctx.restore();
    } else {
      // Apply user image transformations for final export with perspective
      ctx.save();
      const centerX = canvas.width * userImagePosition.x;
      const centerY = canvas.height * userImagePosition.y;
      const scaledWidth = userImg.width * userImageScale;
      const scaledHeight = userImg.height * userImageScale;

      ctx.translate(centerX, centerY);
      if (userImageFlipped) {
        ctx.scale(-1, 1);
      }
      ctx.rotate((userImageRotation * Math.PI) / 180);

      // Apply perspective transformation
      if (userImagePerspectiveX !== 0 || userImagePerspectiveY !== 0) {
        const matrix = new DOMMatrix();
        matrix.a = 1 + userImagePerspectiveX / 100;
        matrix.b = userImagePerspectiveY / 200;
        matrix.c = userImagePerspectiveX / 200;
        matrix.d = 1 + userImagePerspectiveY / 100;
        ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
      }

      ctx.drawImage(userImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();
    }

    ctx.drawImage(helmetImg, helmetX, helmetY, helmetWidth, helmetHeight);
  }
}
