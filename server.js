import express from 'express';
import multer from 'multer';
import cors from 'cors'
import { OpenAI } from 'langchain/llms/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors())
app.use(express.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.use(express.static('public'));

const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0
});

const fileManagerContent = {};

const executor = initializeAgentExecutorWithOptions([], model, {
    agentType: "zero-shot-react-description",
});

app.post('/api/send-message', upload.single('file'), async (req, res) => {
    const message = req.body.message;
    const file = req.file;

    console.log('Received message:', message);
    if (file) {
        console.log('Received file:', file.originalname);
    }

    // Save the message and file content to in-memory storage
    fileManagerContent[message] = file ? file.buffer.toString('utf-8') : '';

    res.json({ success: true, message: 'Message and file received successfully.' });

    const llmResponse = await executor.call({
        input: { message, fileContent: fileManagerContent[message] }
    });

    res.locals.llmResponse = llmResponse;
});

// Endpoint to get LLM response
app.get('/api/get-response', (req, res) => {
    res.json({ success: true, output: res.locals.llmResponse.output });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
