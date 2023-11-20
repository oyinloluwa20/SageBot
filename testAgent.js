import * as dotenv from "dotenv";
dotenv.config();


import { OpenAI } from "langchain/llms/openai";
import { SerpAPI } from "langchain/tools";
// import { Calculator } from "langchain/tools/calculator";
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

]

const excutor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: "true"

})

console.log('loaded the agent..')

const res = await excutor.call({
    input: "site: stackoverflow.com explain express js, where did you get this result"
})
console.log(res.output)
// site: stackoverflow.com
