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
    input: "site: stackoverflow.com what is wrong with is my code, async function loadContent(fileItem) {const editor = document.getElementById('editor');editor.innerHTML = '';if (fileItem.dataset.saved) {const content = fileItem.dataset.saved;editor.innerText = content;} else {console.log('No content saved for this file.');}}"
})
console.log(res.output)
// site: stackoverflow.com
