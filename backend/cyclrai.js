const express = require('express');
const cors = require('cors');
const multer = require("multer");
const fs = require("fs");
const geminiAPI = require('./gemini-api-service.js')
const app = express();
const upload = multer({ dest: "uploads/" });
const port = 3000;

/** cyclrai.js -
 *  Backend API for the CyclrAI website
 * 
 *  @author Grant Zhou
 *  @since January 20, 2025
 */

// Middleware
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

const chatbot = new geminiAPI(`You are an AI assistant that helps with sorting trash. Each time you are goven the name of one item, you will first output one word: If the item can be recycled by throwing it into a standard recycling bin, output "recyclable." If the item needs to be brought to a special place, a specialized recycling facility, a specific recycing center, or only some recycling programs, curbside or otherwise, will accept an item, output "special." If the item cannot be recycled, output "trash." Important: throwing something in a compost bin does not count as throwing an item in a standard recycling bin! Then, give an explanation detailing the specifics of your answer. Make your answer short, preferrably less than one paragraph. At the end, if the user's item is recyclable, tell the user the most optimal location to recycle the user's item.`);

const imagePrompt = `Only output a list of every item in this image with commas after each item. Do not add anything else. Do not add on with a description. Do not include animals or humans. Do not include items that are as large or larger than a house, such as an ocean or a bridge.`

/** Evaluates each item's recyclability using Gemini API
 *  @param {*}  item to be evaluated
 *  @returns    Gemini response as object in the form { item, status, description }
 */
async function evaluate(item) {
    let response = await chatbot.prompt(item);
    let status = response.split(' ')[0].split('\n')[0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, '').toLowerCase().trim();
    response = response.substring(status.length + 1).trim();

    item = item.replace(/\b\w/g, char => char.toUpperCase());

    return { item, status, description: response };
}

app.post("/get-items", upload.single("image"), async (req, res) => {
    console.log(`[INFO] Received POST request to /get-items\n`);    // Received get request
    const start = Date.now();   // Start timer
    console.log(req.file);

    if (!req.file) return res.status(400).send("No file uploaded"); // If no file uploaded

    // Get items in image by prompting Gemini API with image
    const filePath = req.file.path;
    const mimeType = req.body.type || "application/octet-stream";
    let response;
    try {
        const data = await fs.promises.readFile(filePath);
        const imageResp = data.buffer;
        response = await chatbot.call(imageResp, mimeType, imagePrompt);
    } catch (err) {
        return res.status(500).send("Error reading file");
    }

    // Gets list of items
    const items = response.split(/[\.,!?;:()"'—\[\]{}]/).filter(Boolean).map(item => item.trim());
    
    // Send result
    res.json(items);

    // Log in console success and time elapsed
    const end = Date.now() - start;
    console.log(`[INFO] Response from external API: 200 OK in ${end}ms\n`);
});


app.get("/process/:item", async (req, res) => {
    console.log(`[INFO] Received GET request to /process\n`);    // Received get request
    const start = Date.now();   // Start timer

    // Get item from url
    const item = req.params.item;
    
    // Use Gemini API to determine recyclability of item
    const result = await evaluate(item);

    // Send result
    res.json(result);

    // Log in console success and time elapsed
    const end = Date.now() - start;
    console.log(`[INFO] Response from external API: 200 OK in ${end}ms\n`);
});

// Run server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
})

