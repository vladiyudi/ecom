import * as fal from "@fal-ai/serverless-client";

// Initialize the fal client with the API key
fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

export async function generateFashionModel(prompt) {
  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: {
      prompt: prompt || "full body shot, fashion model wearing jeans and t-shirt in a neutral pose, full body shot, studio lighting",
      image_size: "portrait_4_3",
      safety_tolerance: 5
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });
  
  return result.images[0].url;
}

export async function generateClothesOnModel(humanImageUrl, garmentImageUrl, description) {
  const result = await fal.subscribe("fal-ai/idm-vton", {
    input: {
      human_image_url: humanImageUrl,
      garment_image_url: garmentImageUrl,
      description: description || "Stylish outfit"
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });
  return result.image.url;
}

export async function upscaleImage(imageUrl) {
  const upscaleResult = await fal.subscribe("fal-ai/clarity-upscaler", {
    input: {
      image_url: imageUrl
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });
  
  if (upscaleResult && upscaleResult.image) {
    return upscaleResult.image.url;
  }
  return imageUrl; // Return original URL if upscaling fails
}

export async function downloadImage(imageUrl, filename) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function downloadAllImages(images) {
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const imageUrl = image.url || image.generatedImage;
    await downloadImage(imageUrl, `image_${i + 1}.png`);
  }
}

export async function swapClothesCatVton (humanImageUrl, garmentImageUrl, clothesType='lower') {
  const result = await fal.subscribe("fal-ai/cat-vton", {
    input: {
      human_image_url: humanImageUrl,
      garment_image_url: garmentImageUrl,
      cloth_type: clothesType,
      image_size: "portrait_4_3"
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });
  return result.image.url;
}