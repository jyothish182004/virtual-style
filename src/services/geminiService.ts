import { GoogleGenAI } from "@google/genai";
import { StyleAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function performVirtualTryOn(userImageBase64: string, productImageUrl: string, productDescription: string = "fashion item", category: string = "Shirts") {
  try {
    let productData = productImageUrl;
    if (productImageUrl.startsWith('http')) {
      try {
        // Use a CORS proxy to fetch the image reliably
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(productImageUrl)}&w=800&fit=cover`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Failed to fetch image via proxy");
        const blob = await response.blob();
        productData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (fetchError) {
        // Fallback to URL if proxy fails, though proxy is very reliable
        productData = productImageUrl; 
      }
    }

    const userPart = {
      inlineData: {
        data: userImageBase64.split(',')[1],
        mimeType: "image/png",
      },
    };

    const productPart = productData.startsWith('data:') ? {
      inlineData: {
        data: productData.split(',')[1],
        mimeType: "image/png",
      },
    } : { text: productData }; // Pass URL if base64 failed

    let categorySpecificInstruction = "";
    if (category === "Accessories") {
      categorySpecificInstruction = "Add this accessory (e.g., sunglasses, watch, belt) to the person. If it's sunglasses, place them on the face. If it's a watch, place it on the wrist. Do NOT change the person's main outfit.";
    } else if (category === "Pants") {
      categorySpecificInstruction = "Replace the person's current pants/trousers with the pants shown in the second image. Ensure the waistline and length look natural.";
    } else if (category === "Shoes") {
      categorySpecificInstruction = "Replace the person's current shoes with the shoes shown in the second image. Match the perspective and lighting.";
    } else {
      categorySpecificInstruction = "Replace the person's current top/shirt/dress with the item shown in the second image.";
    }

    const prompt = `Perform a high-fidelity virtual try-on. 
    CRITICAL: You MUST use the EXACT item shown in the second image. 
    - Match the EXACT color, pattern, texture, and design details (like buttons, collar shape, or specific stitching).
    - Do NOT substitute it with a generic or "improved" version of the item.
    
    1. Extract the specific ${category} item from the second image/URL.
    2. ${categorySpecificInstruction}
    3. Seamlessly overlay it onto the person in the first image.
    4. Match the lighting, shadows, and texture of the original portrait.
    5. Maintain the person's exact pose, facial features, and background.
    6. The item is: ${productDescription}.
    Return ONLY the resulting high-resolution image.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [userPart, productPart, { text: prompt }] },
    });

    for (const part of result.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Try-on error:", error);
    throw error;
  }
}

export async function getStyleAdvice(userImageBase64: string, resultImageBase64: string, productDescription: string) {
  try {
    const userPart = {
      inlineData: {
        data: userImageBase64.split(',')[1],
        mimeType: "image/png",
      },
    };

    const resultPart = {
      inlineData: {
        data: resultImageBase64.split(',')[1],
        mimeType: "image/png",
      },
    };

    const prompt = `As a professional fashion stylist, evaluate this virtual try-on. 
    The user is trying on: ${productDescription}.
    Compare the 'before' (user image) and 'after' (try-on result).
    Provide a brief, encouraging critique. Does the color suit them? Does the style match their vibe? 
    Give 2-3 specific tips to complete the look (accessories, shoes, etc.).
    Keep it concise and stylish.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [userPart, resultPart, { text: prompt }] },
    });

    return result.text;
  } catch (error) {
    console.error("Style advice error:", error);
    return "You look great! This style really complements your features.";
  }
}

const SAFE_FASHION_IDS: Record<string, string[]> = {
  Shirts: [
    "1521572267360-ee0c2909d518", // White Shirt
    "1581655353564-df123a1eb820", // Blue Polo
    "1598033129183-a4d9a0ae0338", // White T-shirt
    "1617137968427-83c39c2a4abc", // Blue Shirt
    "1555689502-c4b22d76c56f", // Patterned Shirt
    "1602810318383-e3e5c5638a35", // Casual Shirt
    "1594932224010-75f2a77bd48f", // Suit Jacket
    "1503342217034-24224c8ad0db"  // Denim Shirt
  ],
  Pants: [
    "1542272604-18797c21e112", // Blue Jeans
    "1594633312681-425c7b97ccd1", // Trousers
    "1584370848010-1732416c4739", // Chinos
    "1541099649105-037018683518", // Slim Jeans
    "1624378439575-d8705ad7ae80", // Cargo Pants
    "1565084888221-ad5ec29e8978"  // Formal Pants
  ],
  Shoes: [
    "1542291026-7eec264c27ff", // Red Sneakers
    "1543163530-bc64aaad15d5", // Heels
    "1560769629-9d672210099e", // White Sneakers
    "1525966222481-db347979a3ee", // Boots
    "1595950613107-08434243f141", // Running Shoes
    "1460353581641-37c8c6c1827a"  // Leather Shoes
  ],
  Accessories: [
    "1523275335684-37898b6baf30", // Watch
    "1511499767333-a1115503980b", // Sunglasses
    "1611621477686-df7a8274d153", // Handbag
    "1523293182036-c32307a08f81", // Belt
    "1509109103702-0429d19a8437", // Hat
    "1539533397368-6a0cc819c214"  // Scarf
  ]
};

export async function searchProducts(query: string, profile?: any, gender?: string) {
  try {
    const profileContext = profile ? `Consider the user's profile: ${JSON.stringify(profile)}.` : "";
    const genderContext = gender ? `The user is ${gender}. ONLY suggest ${gender} clothing and styles.` : "";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for a complete fashion collection (including shirts, pants, shoes, and accessories) related to: "${query}". ${profileContext} ${genderContext}
      Return a JSON array of 24 products (exactly 6 for each category: Shirts, Pants, Shoes, Accessories) that form a cohesive look. Each product should have:
      - id (string)
      - name (string)
      - price (string)
      - platform (one of: Amazon, Myntra, Ajio, Flipkart, Meesho)
      - category (MUST be exactly one of: Shirts, Pants, Shoes, Accessories. 
        Note: Do NOT include 'Dresses' or 'One-pieces' in 'Shirts'. Only include tops, shirts, and blazers.)
      - imageUrl (MANDATORY: Use high-quality Unsplash URLs. Format: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&q=80&w=800. 
        IMPORTANT: Use these REAL Unsplash IDs for fashion to ensure images are visible and relevant:
        - Shirts: ${SAFE_FASHION_IDS.Shirts.join(', ')}
        - Pants: ${SAFE_FASHION_IDS.Pants.join(', ')}
        - Shoes: ${SAFE_FASHION_IDS.Shoes.join(', ')}
        - Accessories: ${SAFE_FASHION_IDS.Accessories.join(', ')}
        Do NOT use any other IDs. If you need more, use these same IDs with different seeds.
      )
      - description (brief)
      - link (A realistic search result URL for that platform)
      
      Example: { "id": "1", "name": "Slim Fit Navy Blazer", "price": "₹4,299", "platform": "Myntra", "category": "Shirts", "imageUrl": "https://images.unsplash.com/photo-1594932224010-75f2a77bd48f?auto=format&fit=crop&q=80&w=800", "description": "Premium wool blend blazer", "link": "https://www.myntra.com/blazer" }`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const products = JSON.parse(response.text);
    return products.map((p: any, index: number) => {
      let category = p.category || 'Shirts';
      if (category.toLowerCase().includes('shirt')) category = 'Shirts';
      else if (category.toLowerCase().includes('pant') || category.toLowerCase().includes('trouser')) category = 'Pants';
      else if (category.toLowerCase().includes('shoe') || category.toLowerCase().includes('sneaker') || category.toLowerCase().includes('heel')) category = 'Shoes';
      else if (category.toLowerCase().includes('access') || category.toLowerCase().includes('watch') || category.toLowerCase().includes('sunglass') || category.toLowerCase().includes('belt')) category = 'Accessories';
      
      // FORCE VALID IMAGE ID IF AI HALLUCINATED
      let imageUrl = p.imageUrl;
      const safeIds = SAFE_FASHION_IDS[category as keyof typeof SAFE_FASHION_IDS] || SAFE_FASHION_IDS.Shirts;
      const hasSafeId = safeIds.some(id => imageUrl.includes(id));
      
      if (!hasSafeId) {
        const fallbackId = safeIds[index % safeIds.length];
        imageUrl = `https://images.unsplash.com/photo-${fallbackId}?auto=format&fit=crop&q=80&w=800`;
      }

      return { ...p, category, imageUrl };
    });
  } catch (error) {
    console.error("Product search error:", error);
    return [];
  }
}

export async function analyzeUserStyle(userImageBase64: string): Promise<StyleAnalysis> {
  try {
    const userPart = {
      inlineData: {
        data: userImageBase64.split(',')[1],
        mimeType: "image/png",
      },
    };

    const prompt = `Analyze this person's photo for a high-end fashion consultation. 
    Be extremely detailed and observant about:
    1. Gender: Identify if the person is male, female, or non-binary to provide appropriate clothing suggestions.
    2. Color Theory: Analyze their skin undertones, hair color, and eye color. Suggest a palette that creates harmony (e.g., "Deep Winter", "Warm Autumn").
    3. Body Architecture: Analyze the silhouette, shoulder structure, and proportions. Suggest cuts and fabrics that enhance their natural frame.
    4. Aesthetic DNA: Identify their current vibe and suggest how to elevated it to a "High Fashion" level.
    
    Provide:
    - A sophisticated summary of their aesthetic.
    - A recommended color palette (4 hex colors) with names.
    - 3 specific style directives focusing on structure and fit.
    - A specific search query to find items that would perfectly complement this DNA.
    - The detected gender (male, female, or unisex).
    
    Return the response in JSON format:
    {
      "aesthetic": "...",
      "colors": ["#hex1", "#hex2", "#hex3", "#hex4"],
      "advice": ["...", "...", "..."],
      "recommendedSearch": "...",
      "gender": "..."
    }`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [userPart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(result.text);
  } catch (error) {
    console.error("Style analysis error:", error);
    return {
      aesthetic: "You have a great natural style! We've picked some items that will enhance your look.",
      colors: ["#000080", "#36454F", "#808000", "#F5F5DC"],
      advice: [
        "Adds structure to any outfit.",
        "Versatile and comfortable.",
        "The perfect accessory."
      ],
      recommendedSearch: "minimalist luxury fashion"
    };
  }
}

export async function getStylistChatResponse(message: string, history: any[] = [], images: string[] = []) {
  try {
    const parts: any[] = [{ text: message }];
    
    if (images.length > 0) {
      images.forEach(img => {
        parts.push({
          inlineData: {
            data: img.split(',')[1],
            mimeType: "image/png",
          },
        });
      });
    }

    const chat = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts }
      ],
      config: {
        systemInstruction: "You are a professional fashion stylist. You help users with outfit ideas, style advice, and fashion trends. Be encouraging, stylish, and concise. If the user provides images (e.g., of two different outfits), compare them and suggest which one is better based on color, fit, and occasion. If they describe their clothes (e.g., 'white shirt, black pants'), provide color coordination advice. If they are still unsure, ask them to upload a photo for a more accurate assessment.",
      }
    });

    const response = await chat;
    return response.text;
  } catch (error) {
    console.error("Stylist chat error:", error);
    return "I'm sorry, I'm having a bit of a fashion emergency and can't respond right now. Try again in a moment!";
  }
}
