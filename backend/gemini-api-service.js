const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} = require('@google/generative-ai');
require('dotenv').config();

/** gemini-api.service.js -
 *  Defines the geminiAPI class
 * 
 *  @author Grant Zhou
 *  @since January 20, 2025
 */

const DEF_API_KEY = process.env.API_KEY;
const DEF_MODEL_NAME = 'gemini-1.5-flash';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

class geminiAPI {

    /** Object that communicates with the Gemini API.
     *  Supports customizable system prompt, model, and api key
     */
    constructor(sysPrompt = '', modelName = DEF_MODEL_NAME, apiKey = DEF_API_KEY) {
        this.sysPrompt = (sysPrompt == '') ? [] : [
            { role: 'user', parts: [{ text: `System prompt: ${sysPrompt} Respond understood if you got it.`}] },
            { role: 'model', parts: [{ text: "Understood."}] }
        ];
        this.modelName = modelName;
        this.apiKey = apiKey;
        this.generationConfig = {
            temperature: 0.4,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        };
        this.safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ];

        Object.freeze(this.modelName);
        Object.freeze(this.sysPrompt);
        Object.freeze(this.apiKey);
        Object.freeze(this.generationConfig);
        Object.freeze(this.safetySettings);
    }

    /** Resets API message history (keeps system prompt) - TODO*/
    reset() {
    }

    /** Creates generative GeminiAPI model using system prompt */
    createModel() {
        const genAI = new GoogleGenerativeAI(this.apiKey);
        const model = genAI.getGenerativeModel({ model: this.modelName });
        console.log(`\t\tModel generated...`)
        return model;
    }

    /** Processes Gemini API response into a response string
     *  @param {*}   result 
     *  @returns     respose string
     */
    process(result) {
        return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, something went wrong.";
    }

    /** Catches when the GeminiAPI key is exausted, and performs exponential backoff until service is up again
     * 
     * @param {*} call 
     * @returns 
     */
    async catchExaustion(call) {
        let response;
        let exponentialDelay = 5000;
        while (true) {
            try {
                console.log("\t\tCalling API...");
                response = await call();
                console.log("\t\tSuccessfully received response...\n");
                return response;
            }
            catch (error) {
                console.log("\t\tEncountered error: " + error);
                console.log("\t\tWaiting 10s before calling again...")
                await delay(exponentialDelay); // Wait before calling again
                exponentialDelay *= 1.5;
            }
        }
    }

    /** Full chat - API remembers previous chat messages each request - TODO
     * 
     *  @param {*} prompt    API string request
     *  @returns             API response
     */
    async chat(prompt) {
    }

    /** Singular call - Resets API memory before each request
     *  
     *  @param {*} prompt   API string request
     *  @returns            API response
     */
    async prompt(prompt) {
        // Set up model
        console.log(`\tExecuting method: prompt(${prompt}):`);
        const model = this.createModel();
        let history = structuredClone(this.sysPrompt);
        history.push({ role: "user", parts: [{ text: prompt }] });
        const response = await this.catchExaustion(async () => {
            return await model.generateContent({
                contents: history,
                generationConfig: this.generationConfig,
                safetySettings: this.safetySettings
            });
        });

        const textOutput = this.process(response);
        return textOutput;
    }

    /** Singular image call - independent from the current object
     * @param {*} img       Image input in the ArrayBuffer format
     * @param {*} imgType   image type, jpeg by default
     * @param {*} prompt    text prompt, blank by default
     * @returns             API response
     */
    async call(img, imgType, prompt) {
        const model = this.createModel();

        console.log(`\tExecuting method: call(${prompt}): Recieved response from Gemini API`);
        const response = await this.catchExaustion(async () => { return await model.generateContent([
                {
                inlineData: {
                    data: Buffer.from(img).toString("base64"),
                    mimeType: imgType,
                },
                },
                prompt,
            ])
        });

        const textOutput = this.process(response);
        return textOutput;
    }
    
}

module.exports = geminiAPI;