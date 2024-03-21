const axios = require("axios");

exports.handler = async (event) => {
  // Only proceed if the incoming request is a POST request
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Define the payload for the GitHub API request
    const payload = {
      event_type: "trigger-custom-action", // Must match the event type expected by your GitHub Actions workflow
    };

    // Read the GitHub token from Netlify's environment variables
    const token = process.env.GITHUB_TOKEN; // Make sure to set this in your Netlify site's environment variables
    const repo = "readyfastcode/foodready-mobile"; // Specify your GitHub repository

    // Make a POST request to the GitHub API to trigger the repository_dispatch event
    await axios.post(
      `https://api.github.com/repos/${repo}/dispatches`,
      payload,
      {
        headers: {
          Authorization: `token ${token}`, // Use the GitHub token for authorization
          Accept: "application/vnd.github.everest-preview+json", // Use the custom media type for repository_dispatch events
        },
      }
    );

    // If the request is successful, return a success message
    return {
      statusCode: 200,
      body: "GitHub Action triggered successfully!",
    };
  } catch (error) {
    // Log any errors and return a 500 Internal Server Error status
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};
