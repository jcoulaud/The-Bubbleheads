import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const { prompt, useStreaming = true } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Load and convert the helmet image to PNG
    const helmetImagePath = path.join(process.cwd(), 'public', 'original-helmet.jpeg');
    const helmetImageBuffer = await fs.readFile(helmetImagePath);

    // Convert JPEG to PNG using sharp
    const pngBuffer = await sharp(helmetImageBuffer).png().toBuffer();

    // Create the final prompt using the exact template
    const finalPrompt = `A ${prompt} wearing a sleek, round space helmet with a reflective glass visor and colorful side panel, floating in outer space. The helmet is the same style as classic astronaut helmets with a glossy, fishbowl-like dome. The background has glowing nebulae and stars. Art style is clean, vibrant digital illustration with soft highlights and smooth lines, matching a cartoon sci-fi aesthetic, same style as the picture used.`;

    // Create form data for the image edit endpoint
    const formData = new FormData();
    const blob = new Blob([pngBuffer], { type: 'image/png' });
    formData.append('image', blob, 'helmet.png');
    formData.append('prompt', finalPrompt);
    formData.append('model', 'gpt-image-1');
    formData.append('n', '1');
    formData.append('size', '1024x1024');
    formData.append('quality', 'high');

    if (useStreaming) {
      formData.append('stream', 'true');
      formData.append('partial_images', '3');
    }

    // Make the request
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({ error: error.error?.message || 'Failed to generate image' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Handle streaming response
    if (useStreaming && response.headers.get('content-type')?.includes('text/event-stream')) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');

              // Keep the incomplete line in the buffer
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.trim()) {
                  // Forward the SSE line directly
                  controller.enqueue(encoder.encode(line + '\n'));
                } else {
                  // Empty line (SSE message separator)
                  controller.enqueue(encoder.encode('\n'));
                }
              }
            }
          } catch {
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({ error: 'Stream error' })}\n\n`,
              ),
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const data = await response.json();

    let imageUrl;
    if (data.data && data.data[0]) {
      if (data.data[0].b64_json) {
        imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
      } else if (data.data[0].url) {
        imageUrl = data.data[0].url;
      }
    }

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No image in response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If it's a URL, fetch and convert to base64
    if (imageUrl.startsWith('http')) {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      imageUrl = `data:image/png;base64,${base64}`;
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate image',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
