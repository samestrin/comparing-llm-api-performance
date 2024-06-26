const ping = require("ping");
const { URL } = require("url");

/**
 * Measure latency to a given URL.
 * @param {string} url - The URL to measure latency to.
 * @param {number} attempts - The number of ping attempts.
 * @returns {number|boolean} - The average latency or false if unsuccessful.
 */
async function measureLatency(url, attempts = 10) {
  const hostname = new URL(url).hostname;
  const domainName = hostname.split(".").slice(-2).join("."); // Extract the domain name
  const pingTimes = [];

  /**
   * Ping a given host and return the result.
   * @param {string} host - The host to ping.
   * @param {number} attemptNumber - The current attempt number.
   * @returns {Object|null} - The ping result or null if failed.
   */
  async function pingHost(host, attemptNumber) {
    try {
      const pingResult = await ping.promise.probe(host);

      if (
        pingResult.alive &&
        typeof pingResult.avg === "number" &&
        !isNaN(pingResult.avg)
      ) {
        return pingResult.avg;
      }

      if (
        pingResult.alive &&
        typeof pingResult.time === "number" &&
        !isNaN(pingResult.time)
      ) {
        pingTimes.push(pingResult.time);
      }
    } catch (error) {
      console.error(
        `Attempt ${attemptNumber} failed for ${host}: ${error.message}`
      );
    }

    return null;
  }

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const latency = await pingHost(hostname, attempt);
    if (latency !== null) {
      return latency;
    }

    if (attempt < attempts) {
      await sleep(250);
    }
  }

  // If all attempts using the hostname fail, try using the domain name (for Hugging Face and Reka AI)
  if (pingTimes.length === 0) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const latency = await pingHost(domainName, attempt);
      if (latency !== null) {
        return latency;
      }

      if (attempt < attempts) {
        await sleep(250);
      }
    }
  }

  if (pingTimes.length > 0) {
    const total = pingTimes.reduce((acc, time) => acc + time, 0);
    const averageTime = total / pingTimes.length;
    return averageTime;
  }

  return false;
}

/**
 * Sleep for a given amount of time to avoid rate limiting.
 * @param {number} ms - The time to sleep in milliseconds.
 * @returns {Promise<void>} - A promise that resolves after the specified time.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { measureLatency, sleep };
