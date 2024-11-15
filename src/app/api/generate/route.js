import { generateFashionModel, generateClothesOnModel, upscaleImage, swapClothesCatVton } from '../../utils/generateFunctions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import connectDB from '../../lib/mongodb';
import User from '../../models/User';

export async function POST(req) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const session = await getServerSession(authOptions);
        if (!session) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: 'Unauthorized' })));
          controller.close();
          return;
        }

        const { images } = await req.json();
        
        if (!images || images.length === 0) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: 'No images provided' })));
          controller.close();
          return;
        }

        // Connect to database and create new collection
        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: 'User not found' })));
          controller.close();
          return;
        }

        // Create new collection
        const newCollection = {
          date: new Date(),
          name: "",
          images: []
        };
        user.collections.push(newCollection);
        const collectionIndex = user.collections.length - 1;

        for (const image of images) {
         
          const allStages = {}
         
          const description = `${image.description || ''}`;

          const modelPrompt = `${image.modelDescription || 'full body shot, fashion model wearing jeans and t-shirt in a neutral pose, studio lighting'}`
          
          let modelImageUrl = await generateFashionModel(modelPrompt);
          allStages.model = modelImageUrl

          if (image.bottom && image.bottom.url) {
            modelImageUrl = await swapClothesCatVton(modelImageUrl, image.bottom.url, 'lower');
            allStages.lower = modelImageUrl
          }

          let generatedImageUrl = await generateClothesOnModel(modelImageUrl, image.url, description);
          allStages.uper = generatedImageUrl

          if (image.upscale) {
            generatedImageUrl = await upscaleImage(generatedImageUrl);
            allStages.final = generatedImageUrl
          }

          // Add generated image to collection
          user.collections[collectionIndex].images.push({
            description: description,
            imageUrl: generatedImageUrl
          });
          await user.save();

          const result = {
            type: 'outfit',
            originalImage: image.url,
            generatedImage: generatedImageUrl,
            description: description,
            modelDescription: image.modelDescription,
            upscaled: image.upscale,
            collectionId: user.collections[collectionIndex]._id
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
