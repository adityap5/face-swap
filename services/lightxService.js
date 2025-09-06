const fetch = require("node-fetch");

class LightXService {
  constructor() {
    this.apiKey = process.env.LIGHTX_API_KEY;
    this.baseUrl = "https://api.lightxeditor.com/external/api";
    console.log("Loaded LightX API Key:", !!this.apiKey); 
  }

  // Upload image to LightX
  async uploadImage(imageBuffer, contentType) {
    try {
      // Step 1: Ask LightX for presigned URL
      const uploadUrlResponse = await fetch(`${this.baseUrl}/v2/uploadImageUrl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          uploadType: "imageUrl",
          size: imageBuffer.length,
          contentType,
        }),
      });

      if (!uploadUrlResponse.ok) {
        const text = await uploadUrlResponse.text();
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status} → ${text}`);
      }

      const uploadData = await uploadUrlResponse.json();
      console.log("Upload URL response:", uploadData);

      if (uploadData.statusCode !== 2000) {
        throw new Error(`Upload URL API error: ${uploadData.message}`);
      }

      // Step 2: PUT the actual file to uploadImage (presigned URL)
      const uploadResponse = await fetch(uploadData.body.uploadImage, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: imageBuffer,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image: ${uploadResponse.status}`);
      }

      console.log("Image uploaded successfully");
      return uploadData.body.imageUrl; 
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Perform face swap
  async performFaceSwap(originalImageUrl, styleImageUrl) {
    try {
      const swapResponse = await fetch(`${this.baseUrl}/v1/face-swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          imageUrl: originalImageUrl,
          styleImageUrl: styleImageUrl,
        }),
      });

      if (!swapResponse.ok) {
        const text = await swapResponse.text();
        throw new Error(`Face swap request failed: ${swapResponse.status} → ${text}`);
      }

      const swapData = await swapResponse.json();
      console.log("Face swap response:", swapData);

      if (swapData.statusCode !== 2000) {
        throw new Error(`Face swap API error: ${swapData.message}`);
      }

      const orderId = swapData.body.orderId;
      const maxRetries = swapData.body.maxRetriesAllowed || 5;

      return await this.pollOrderStatus(orderId, maxRetries);
    } catch (error) {
      console.error("Face swap error:", error);
      throw new Error(`Face swap failed: ${error.message}`);
    }
  }

  // Poll until job finishes
  async pollOrderStatus(orderId, maxRetries = 5) {
    let retries = 0;

    while (retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const statusResponse = await fetch(`${this.baseUrl}/v1/order-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({ orderId }),
      });

      if (!statusResponse.ok) {
        const text = await statusResponse.text();
        throw new Error(`Status check failed: ${statusResponse.status} → ${text}`);
      }

      const statusData = await statusResponse.json();
      console.log("Status check response:", statusData);

      if (statusData.statusCode !== 2000) {
        throw new Error(`Status API error: ${statusData.message}`);
      }

      const { status, output } = statusData.body;

      if (status === "active" && output) {
        console.log("Face swap completed:", output);
        return output;
      } else if (status === "failed") {
        throw new Error("Face swap processing failed");
      }

      retries++;
    }

    throw new Error("Face swap processing timed out");
  }
}

module.exports = new LightXService();
