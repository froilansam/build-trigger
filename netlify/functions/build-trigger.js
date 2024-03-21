const Octokit = require("octokit");

exports.handler = async (event) => {
  // Only proceed if the incoming request is a POST request
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({
      auth: token,
    });

    await octokit.request(
      "POST https://api.github.com/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
      {
        owner: "readyfastcode",
        repo: "foodready-mobile",
        workflow_id: "manual-staging-build.yml",
        ref: "MA-792/fix-workflows",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

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
