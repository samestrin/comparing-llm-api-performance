/**
 * @file testLLMPerformanceSmallModels.js
 * @description A simple Node.js script that uses llm-prepare to send the same prompt 5 times to each available LLM API provider, collects performance data, and appends the results to "
 * results.csv".
 */

const { LLMInterfaceSendMessage } = require("llm-interface");
const dotenv = require("dotenv");
const { performance } = require("perf_hooks");
const fs = require("fs");

dotenv.config();

// Establish providers
let providers = [
  {
    name: "OpenAI",
    key: process.env.OPENAI_API_KEY,
    interface: "openai",
    model: "gpt-3.5-turbo",
  },
  {
    name: "AI21 Studio",
    key: process.env.AI21_API_KEY,
    interface: "ai21",
    model: "jamba-instruct",
  },
  {
    name: "Anthropic",
    key: process.env.ANTHROPIC_API_KEY,
    interface: "anthropic",
    model: "claude-3-haiku-20240307",
  },
  {
    name: "Cloudflare AI",
    key: [process.env.CLOUDFLARE_API_KEY, process.env.CLOUDFLARE_ACCOUNT_ID],
    interface: "cloudflareai",
    model: "@cf/tinyllama/tinyllama-1.1b-chat-v1.0",
  },
  {
    name: "Cohere",
    key: process.env.COHERE_API_KEY,
    interface: "cohere",
    model: "command-light",
  },
  {
    name: "Fireworks AI",
    key: process.env.FIREWORKSAI_API_KEY,
    interface: "fireworksai",
    model: "accounts/fireworks/models/phi-3-mini-128k-instruct",
  },
  {
    name: "Google Gemini",
    key: process.env.GEMINI_API_KEY,
    interface: "gemini",
    model: "gemini-1.5-flash",
  },
  {
    name: "Goose AI",
    key: process.env.GOOSEAI_API_KEY,
    interface: "gooseai",
    model: "gpt-neo-125m",
  },
  {
    name: "Groq",
    key: process.env.GROQ_API_KEY,
    interface: "groq",
    model: "gemma-7b-it",
  },
  {
    name: "Hugging Face",
    key: process.env.HUGGINGFACE_API_KEY,
    interface: "huggingface",
    model: "microsoft/Phi-3-mini-4k-instruct",
  },
  {
    name: "Mistral AI",
    key: process.env.MISTRALAI_API_KEY,
    interface: "mistralai",
    model: "mistral-small",
    sleep: 2000,
  },
  {
    name: "Perplexity",
    key: process.env.PERPLEXITY_API_KEY,
    interface: "perplexity",
    model: "llama-3-sonar-small-32k-online",
  },
  {
    name: "Reka AI",
    key: process.env.REKAAI_API_KEY,
    interface: "rekaai",
    model: "reka-edge",
  },
];

// Establish testLLMPerformanceSmallModelsTimestamp
const testLLMPerformanceSmallModelsTimestamp = new Date().toLocaleString();

// Establish simplePrompt
const simplePrompt = "Explain the importance of low latency LLMs.";

// Sleep function to avoid rate limiting
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to test LLM performance using the providers array
const testLLMPerformanceSmallModels = async () => {
  const results = [];
  for (const provider of providers) {
    let totalTime = 0;
    let tokenUsage = 0;
    let successfulResponses = 0;
    let errors = 0;
    const responseTimes = []; // Renaming latencies to responseTimes for clarity

    for (let i = 0; i < 10; i++) {
      try {
        // Send the simple prompt to each API provider
        const start = performance.now();
        const response = await LLMInterfaceSendMessage(
          provider.interface,
          provider.key,
          simplePrompt,
          { max_tokens: 150, model: provider.model }
        );
        const end = performance.now();
        const responseTime = end - start;
        totalTime += responseTime;
        successfulResponses++;
        if (response && response.usage) {
          tokenUsage += response.usage.total_tokens;
        }
        responseTimes.push(responseTime);
      } catch (error) {
        console.error(`Error with ${provider.name}:`, error);
        errors++;
      }

      // Sleep so we don't get rejected by the API providers
      if (provider.sleep) {
        await sleep(provider.sleep);
      } else {
        await sleep(1000);
      }
    }

    try {
      const averageTime = successfulResponses
        ? totalTime / successfulResponses
        : 0;
      const stdDeviation = successfulResponses
        ? Math.sqrt(
            responseTimes
              .map((x) => Math.pow(x - averageTime, 2))
              .reduce((a, b) => a + b, 0) / responseTimes.length
          )
        : 0;
      const averageResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      results.push({
        provider: provider.name,
        model: provider.model,
        averageResponseTime: averageTime.toFixed(5),
        successRate: ((successfulResponses / 10) * 100).toFixed(2),
        stdDeviation: stdDeviation.toFixed(5),
        averageResponseTimeIncludingLatency: averageResponseTime.toFixed(5),
      });
    } catch (error) {
      console.error(
        `Error with ${provider.name} adding to results array.`,
        error
      );
    }
  }

  // Setup csvHeaders
  const csvHeader = `"Provider","Model","Average Response Time (ms)","Std Deviation (ms)","Success Rate (%)","Timestamp"\n`;

  if (!fs.existsSync("results.csv")) {
    fs.writeFileSync("results.csv", csvHeader, "utf8");
  }

  // Build csvContent
  const csvContent =
    results
      .map(
        (result) =>
          `"${result.provider}","${result.model}","${result.averageResponseTimeIncludingLatency}","${result.stdDeviation}","${result.successRate}","${testLLMPerformanceSmallModelsTimestamp}"`
      )
      .join("\n") + "\n";

  fs.appendFileSync("results.csv", csvContent, "utf8");
  console.log("Results written to results.csv");
};

testLLMPerformanceSmallModels();
