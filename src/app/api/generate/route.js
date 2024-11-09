import { generateFashionModel, generateClothesOnModel, upscaleImage } from '../../utils/generateFunctions';

export async function POST(req) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { images } = await req.json();
        
        if (!images || images.length === 0) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: 'No images provided' })));
          controller.close();
          return;
        }

        for (const image of images) {
         
          const description = `${image.description || ''}`;

          const modelPrompt = `${image.modelDescription || 'full body shot, fashion model wearing jeans and t-shirt in a neutral pose, studio lighting'}`
          
          const modelImageUrl = await generateFashionModel(modelPrompt);
          
          let generatedImageUrl = await generateClothesOnModel(modelImageUrl, image.url, description);

          if (image.upscale) {
            generatedImageUrl = await upscaleImage(generatedImageUrl);
          }

          const result = {
            type: 'outfit',
            originalImage: image.url,
            generatedImage: generatedImageUrl,
            description: description,
            modelDescription: image.modelDescription,
            upscaled: image.upscale
          };

          controller.enqueue(encoder.encode(JSON.stringify(result) + '\n'));
        }

        controller.close();
      } catch (error) {
        console.error('Error generating images:', error);
        controller.enqueue(encoder.encode(JSON.stringify({ error: 'Failed to generate images' })));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' }
  });
}