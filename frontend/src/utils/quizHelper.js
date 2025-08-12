// frontend/src/utils/quizHelper.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';

// Use the worker from the installed package
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.mjs`;

// 1. Initialize the Gemini Model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 2. Function to parse different file types
const extractTextFromFile = async (fileBlob, fileType) => {
    if (fileType.includes('pdf')) {
        const arrayBuffer = await fileBlob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map(s => s.str).join(' ');
        }
        return textContent;
    } else if (fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) { // DOCX
        const arrayBuffer = await fileBlob.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } else if (fileType.startsWith('text/')) {
        return fileBlob.text();
    } else {
        throw new Error('Unsupported file type for quiz generation.');
    }
};

// 3. Function to call Gemini and get a quiz
export const generateQuizFromBlob = async (fileBlob, fileType) => {
    const documentText = await extractTextFromFile(fileBlob, fileType);

    const prompt = `
        Analyze the following text from a document and generate a 10-question multiple-choice quiz based on its content.

        The output MUST be a single, valid JSON object. Do not include any text, notes, or markdown formatting like \`\`\`json before or after the JSON object.
        The JSON object must have a single key "questions", which is an array of 10 question objects.
        Each question object must have the following keys:
        - "question": A string containing the question text.
        - "options": An array of 4 strings representing the possible answers.
        - "correctAnswer": An integer representing the 0-based index of the correct answer in the "options" array.

        Here is the document text:
        ---
        ${documentText.substring(0, 15000)}
        ---
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Get the raw text, which might be "dirty"
    const rawText = response.text();

    try {
        // --- THIS IS THE NEW DEFENSIVE LOGIC ---
        // Find the first opening curly brace and the last closing curly brace
        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');

        // If we can't find a JSON object, fail gracefully
        if (startIndex === -1 || endIndex === -1) {
            throw new Error("No JSON object found in the AI's response.");
        }

        // Extract the substring that contains only the JSON object
        const jsonText = rawText.substring(startIndex, endIndex + 1);
        
        // Now, parse the cleaned text
        return JSON.parse(jsonText);
        
    } catch (e) {
        // Log the RAW, "dirty" text for easier debugging in the future
        console.error("Failed to parse JSON from Gemini. Raw response was:", rawText);
        throw new Error("The AI failed to generate a valid quiz. Please try again.");
    }
};