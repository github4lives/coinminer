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
        type: {
            type: Type.STRING,
            description: "The type of result. one of 'material', 'event', or 'nothing'.",
        },
        description: {
            type: Type.STRING,
            description: "A short, lowercase description of the mining action or event. e.g., 'you swing your pickaxe and hit a vein of coal.' or 'you uncover a dusty treasure chest!'",
        },
        foundMaterial: {
            type: Type.STRING,
            description: "If type is 'material', the name of the material found (e.g., 'coal', 'iron'). Null otherwise.",
        },
        quantity: {
            type: Type.NUMBER,
            description: "If type is 'material', the amount found. 0 otherwise.",
        },
        eventName: {
            type: Type.STRING,
            description: "If type is 'event', the name of the event. one of 'treasure', 'geode', 'relic', 'spring', 'cave_in'. Null otherwise.",
        },
        coinsFound: {
            type: Type.NUMBER,
            description: "If event is 'treasure', the amount of coins found. 0 otherwise.",
        },
        energyChange: {
            type: Type.NUMBER,
            description: "If event is 'spring' (positive value) or 'cave_in' (negative value), the energy change. 0 otherwise.",
        },
        foundItem: {
             type: Type.STRING,
             description: "If event is 'geode' or 'relic', the name of the item found. (e.g., 'geode', 'ancient relic'). Null otherwise.",
        }
    },
    required: ["type", "description"],
};

export const generateMiningResult = async (pickaxe: PickaxeType): Promise<MiningResult> => {
    const prompt = `you are a text-based mining game master. the player is mining with a '${pickaxe}' pickaxe.
    
generate a mining result. there are three types of results: 'material', 'event', or 'nothing'.
- 'material': finding standard mining resources.
- 'event': a special, more rare occurrence.
- 'nothing': finding nothing of interest.

base the result on the player's pickaxe. better pickaxes mean better materials and higher chances of good events.
- stone: mostly coal, some iron. low chance of a minor event. high chance of nothing.
- iron: coal, iron, some gold. decent chance of events.
- steel: iron, gold, some diamonds. good chance of events.
- diamond: mostly gold and diamonds. high chance of rare, valuable events.

possible events:
- 'treasure': find a treasure chest with a random amount of coins (coinsfound > 0).
- 'geode': find a 'geode' (founditem: 'geode').
- 'relic': find an 'ancient relic' (founditem: 'ancient relic').
- 'spring': find an underground spring, restoring energy (energychange > 0).
- 'cave_in': a minor cave-in, losing a small amount of energy (energychange < 0).

keep descriptions short, flavorful, and lowercase. ensure all number fields are populated with 0 if not applicable.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: miningResultSchema,
                temperature: 1.0,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MiningResult;

    } catch (error) {
        console.error("error generating mining result:", error);
        // fallback event in case of api error
        return {
            type: 'material',
            description: "you swing your pickaxe and find a small chunk of coal.",
            foundMaterial: 'coal',
            quantity: 1,
        };
    }
};
