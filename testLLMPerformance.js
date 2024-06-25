const { LLMInterface, LLMInterfaceSendMessage } = require("llm-interface");
const { performance } = require("perf_hooks");
const fs = require("fs");
const path = require("path");
const cliProgress = require("cli-progress");

const providers = require("./providers");
const { measureLatency, sleep } = require("./utils");

// Define the path to the .env file
const envPath = path.join(__dirname, ".env");

// Check if the .env file exists
if (!fs.existsSync(envPath)) {
  throw new Error(".env file is missing. Please create one and try again.");
}

// Establish testLLMPerformanceTimestamp
const testLLMPerformanceTimestamp = new Date().toLocaleString();

// Establish simplePrompt
const simplePrompt = "Explain the importance of low latency LLMs.";

// Initialize the progress bar
const progressBar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format:
      " {bar} | {percentage}% | {value}/{total} Attempts | ETA: {eta}s | {providerName} - {modelType}: {modelName}",
  },
  cliProgress.Presets.shades_classic
);

/**
 * Test the performance of LLMs using the providers array.
 */
const testLLMPerformance = async () => {
  const results = [];
  const smallSamples = [];
  const largeSamples = [];

  for (const provider of providers) {
    const smallModel = await LLMInterface.getModelConfigValue(
      provider.interface,
      "model.small"
    );
    const largeModel = await LLMInterface.getModelConfigValue(
      provider.interface,
      "model.large"
    );
    const url = await LLMInterface.getModelConfigValue(
      provider.interface,
      "url"
    );

    let latency;

    try {
      latency = await measureLatency(url);
      if (latency) {
        latency = latency.toFixed(3);
      }
    } catch (error) {
      console.error(`Error pinging ${url}:`, error);
      latency = "N/A";
    }

    const result = {
      provider: provider.name,
      smallModel: {
        model: smallModel,
        averageResponseTime: 0,
        stdDeviation: 0,
        successRate: 0,
      },
      largeModel: {
        model: largeModel,
        averageResponseTime: 0,
        stdDeviation: 0,
        successRate: 0,
      },
      latency: latency,
    };

    for (const modelType of ["smallModel", "largeModel"]) {
      let totalTime = 0;
      let successfulResponses = 0;
      const responseTimes = [];
      let sampleResponse;

      // Create a progress bar for each model type
      const progressBarInstance = progressBar.create(10, 0, {
        providerName: provider.name,
        modelType: modelType,
        modelName: result[modelType].model.name,
      });

      for (let i = 0; i < 10; i++) {
        const thisModel = result[modelType].model.name;
        let response;

        try {
          const start = performance.now();

          try {
            // Send the simple prompt to provider.name
            response = await LLMInterfaceSendMessage(
              provider.interface,
              provider.key,
              simplePrompt,
              { max_tokens: 150, model: thisModel }
            );
          } catch (error) {
            console.error(
              `Error with ${provider.name} using model ${thisModel} (Attempt ${
                i + 1
              }):`,
              error
            );
            continue;
          }

          const end = performance.now();
          const responseTime = end - start;
          totalTime += responseTime;
          successfulResponses++;
          responseTimes.push(responseTime);

          // Capture the first response as a sample
          if (i === 0) {
            sampleResponse = response.results;
          }
        } catch (error) {
          console.error(
            `Error with ${provider.name} using model ${thisModel}:`,
            error
          );
        }

        // Sleep to avoid rate limit exceeded errors
        if (provider.sleep) {
          await sleep(provider.sleep);
        } else {
          await sleep(1000);
        }

        // Update progress bar
        progressBarInstance.increment();
      }

      if (successfulResponses > 0) {
        const averageTime = totalTime / successfulResponses;
        const variance =
          responseTimes
            .map((x) => Math.pow(x - averageTime, 2))
            .reduce((a, b) => a + b, 0) /
          (responseTimes.length - 1);
        const stdDeviation = Math.sqrt(variance);

        result[modelType].averageResponseTime = averageTime.toFixed(5);
        result[modelType].stdDeviation = stdDeviation.toFixed(5);
        result[modelType].successRate = (
          (successfulResponses / 10) *
          100
        ).toFixed(2);
      }

      // Add sample response to the appropriate list
      if (sampleResponse) {
        const sampleMarkdown = `### ${provider.name} Response\n\n\`\`\`\n${sampleResponse}\n\`\`\`\n`;
        if (modelType === "smallModel") {
          smallSamples.push(sampleMarkdown);
        } else {
          largeSamples.push(sampleMarkdown);
        }
      }

      // Stop the progress bar
      progressBarInstance.stop();
    }

    results.push(result);
  }

  // Stop the multi-progress bar
  progressBar.stop();

  // Setup csvHeaders
  const csvHeader = `"Provider","Small Model","Average Response Time (ms)","Std Deviation (ms)","Success Rate (%)","Large Model","Average Response Time (ms)","Std Deviation (ms)","Success Rate (%)","Latency (ms)","Timestamp"\n`;

  const resultsFile = path.join(__dirname, "results.csv");
  const sampleSmallFile = path.join(__dirname, "sampleLarge.md");
  const sampleLargeFile = path.join(__dirname, "sampleSmall.md");

  if (!fs.existsSync(resultsFile)) {
    fs.writeFileSync(resultsFile, csvHeader, "utf8");
    console.log("Header written to results.csv");
  }

  // Build csvContent
  const csvContent =
    results
      .map(
        (result) =>
          `"${result.provider}","${result.smallModel.model.name}","${result.smallModel.averageResponseTime}","${result.smallModel.stdDeviation}","${result.smallModel.successRate}","${result.largeModel.model.name}","${result.largeModel.averageResponseTime}","${result.largeModel.stdDeviation}","${result.largeModel.successRate}","${result.latency}","${testLLMPerformanceTimestamp}"`
      )
      .join("\n") + "\n";

  fs.appendFileSync(resultsFile, csvContent, "utf8");
  console.log("Results written to results.csv");

  // Write markdown files for small and large models
  fs.writeFileSync(sampleSmallFile, smallSamples.join("\n"), "utf8");
  fs.writeFileSync(sampleLargeFile, largeSamples.join("\n"), "utf8");
  console.log(
    "Sample responses written to sample-small.md and sample-large.md"
  );
};

testLLMPerformance();
