import * as dotenv from "dotenv";
dotenv.config();


import { OpenAI } from "langchain/llms/openai";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { initializeAgentExecutorWithOptions } from "langchain/agents"

const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0
});

const tools = [
    new SerpAPI(process.env.SERPAPI_API_KEY, {
        hl: "en",
        gl: "ng"
    }),
    new Calculator(),
]

const excutor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",


})

console.log('loaded the agent..')

const res = await excutor.call({
    input: "what is the present networth of elon"
})
console.log(res.output)

