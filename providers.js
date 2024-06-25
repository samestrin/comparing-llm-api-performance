/**
 * @file providers.js
 * @description An array of providers to test
 */

const dotenv = require("dotenv");

dotenv.config();

// Export providers array
module.exports = [
  {
    name: "OpenAI",
    key: process.env.OPENAI_API_KEY,
    interface: "openai",
  },
  {
    name: "AI21 Studio",
    key: process.env.AI21_API_KEY,
    interface: "ai21",
  },
  {
    name: "Anthropic",
    key: process.env.ANTHROPIC_API_KEY,
    interface: "anthropic",
  },
  {
    name: "Cloudflare AI",
    key: [process.env.CLOUDFLARE_API_KEY, process.env.CLOUDFLARE_ACCOUNT_ID],
    interface: "cloudflareai",
  },
  {
    name: "Cohere",
    key: process.env.COHERE_API_KEY,
    interface: "cohere",
  },
  {
    name: "Fireworks AI",
    key: process.env.FIREWORKSAI_API_KEY,
    interface: "fireworksai",
  },
  {
    name: "Google Gemini",
    key: process.env.GEMINI_API_KEY,
    interface: "gemini",
    sleep: 2500,
  },
  {
    name: "Goose AI",
    key: process.env.GOOSEAI_API_KEY,
    interface: "gooseai",
  },
  {
    name: "Groq",
    key: process.env.GROQ_API_KEY,
    interface: "groq",
  },
  {
    name: "Hugging Face",
    key: process.env.HUGGINGFACE_API_KEY,
    interface: "huggingface",
  },
  {
    name: "Mistral AI",
    key: process.env.MISTRALAI_API_KEY,
    interface: "mistralai",
    sleep: 2000,
  },
  {
    name: "Perplexity",
    key: process.env.PERPLEXITY_API_KEY,
    interface: "perplexity",
  },
  {
    name: "Reka AI",
    key: process.env.REKAAI_API_KEY,
    interface: "rekaai",
  },
];
