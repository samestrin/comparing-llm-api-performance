# Comparing LLM API Performance

This repository contains a test script that sends the simple prompt to each API provider ten times, using a small and large model (via the `llm-interface` model aliases). The script measures the average response time, standard deviation of the response time, latency, and success rate. After each request, the script sleeps to prevent rate limit exceeded errors. (The default sleep is 1 second but is configurable.)

This is the example code for the **[Comparing 13 LLM Providers API Performance with Node.js: Latency and Response Times Across Models](https://dev.to/samestrin/comparing-13-llm-providers-api-performance-with-nodejs-latency-and-response-times-across-models-2ka4)** article.

## Prerequisites

- Node.js
- npm (Node Package Manager)
- [API keys](https://github.com/samestrin/llm-interface/blob/main/docs/APIKEYS.md) for the LLM providers you want to test

## Installation

1. Clone the repository:

```sh
git clone https://github.com/samestrin/comparing-llm-api-performance.git
cd comparing-llm-api-performance
```

2. Install the required npm packages:

```sh
npm install llm-interface ping cli-progress dotenv
```

3. Create a `.env` file in the root directory and add your API keys:g

```sh
OPENAI_API_KEY=your_openai_api_key
AI21_API_KEY=your_ai21_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
COHERE_API_KEY=your_cohere_api_key
GEMINI_API_KEY=your_gemini_api_key
GOOSE_API_KEY=your_goose_api_key
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
MISTRAL_API_KEY=your_mistral_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
REKA_API_KEY=your_reka_api_key
```

## Usage

1. Run the performance test script:

```sh
node testLLMPerformance.js
```

2. The script will append the average response time in milliseconds for each provider in CSV format to `results.csv`.

3. You should now have a `results.csv` file in your current directory. Since CSV is a text-based format, you can open this file using any basic text editor. However, this will display the data in raw format without any table structure. For a more user-friendly view, you can use a freely available online spreadsheet like Google Sheets or Microsoft Excel Online.

## LLM API Performance: Response Times (ms)

The following chart reflects the data I collected for the **Comparing LLM API Performance with Node.js: Average Response Times using npm llm-interface** article.

Based on: [results.csv](results.csv)

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.
