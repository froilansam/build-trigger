const axios = require("axios");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = {
      event_type: "trigger-custom-action", // This should match the type in your GitHub Action
    };
    const token = process.env.GITHUB_TOKEN; // Ensure to set this in your Netlify environment variables
    const repo = "username/repo"; // Replace with your repository

    // await axios.post(`https://api.github.com/repos/${repo}/dispatches`, payload, {
    //   headers: {
    //     Authorization: `token ${token}`,
    //     Accept: 'application/vnd.github.everest-preview+json',
    //   },
    // });

    return {
      statusCode: 200,
      body: "GitHub Action triggered successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};
