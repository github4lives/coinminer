import { GoogleGenAI, Type } from "@google/genai";
import { PickaxeType, MiningResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const miningResultSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.STRING,
            description: "A short, one-sentence, lowercase description of the mining action. e.g., 'you swing your pickaxe and hit a vein of coal.' or 'after a bit of digging, you find nothing of interest.'",
        },
        foundMaterial: {
            type: Type.STRING,
            description: "The name of the material found (e.g., 'coal', 'iron', 'gold', 'diamond'). Use 'null' as a string if nothing was found.",
        },
        quantity: {
            type: Type.NUMBER,
            description: "The amount of the material found. Should be between 1 and 10. Set to 0 if nothing was found.",
        },
    },
    required: ["description", "foundMaterial", "quantity"],
};

export const generateMiningResult = async (pickaxe: PickaxeType): Promise<MiningResult> => {
    const prompt = `you are a text-based mining game master. the player is mining with a '${pickaxe}' pickaxe.
    
generate a mining result based on these probabilities for the pickaxe type:
- stone: 60% chance coal, 30% chance iron, 10% chance nothing.
- iron: 40% chance coal, 40% chance iron, 15% chance gold, 5% chance nothing.
- steel: 20% chance coal, 40% chance iron, 30% chance gold, 10% chance diamond.
- diamond: 10% chance iron, 40% chance gold, 50% chance diamond.

the 'description' should be a flavorful sentence about the result.
the 'foundmaterial' should be one of 'coal', 'iron', 'gold', 'diamond', or 'null'.
the 'quantity' should be a small number appropriate for the material's rarity.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: miningResultSchema,
                temperature: 0.9,
            }
        });

        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText);

        if (parsedResult.foundMaterial === 'null') {
            parsedResult.foundMaterial = null;
        }

        return parsedResult as MiningResult;

    } catch (error) {
        console.error("error generating mining result:", error);
        // fallback event in case of api error
        return {
            description: "you swing your pickaxe and find a small chunk of coal.",
            foundMaterial: 'coal',
            quantity: 1,
        };
    }
};
