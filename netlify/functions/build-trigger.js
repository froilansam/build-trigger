const { Octokit } = require("octokit");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({
      auth: token,
    });

    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/actions/workflows",
      {
        owner: "readyfastcode",
        repo: "foodready-mobile",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    console.log(JSON.stringify(response.data, null, 2));

    const res = await octokit.request(
      "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
      {
        owner: "readyfastcode",
        repo: "foodready-mobile",
        workflow_id: "89219970",
        ref: "MA-792/fix-workflows",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    console.log(JSON.stringify(res, null, 2));

    // Octokit.js
    // https://github.com/octokit/core.js#readme

    const workflowRuns = await octokit.request(
      "GET /repos/{owner}/{repo}/actions/runs",
      {
        owner: "readyfastcode",
        repo: "foodready-mobile",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (workflowRuns.workflow_runs?.length) {
      const lastWorkflowRun = workflowRuns.workflow_runs[0];
      console.log(
        `Last workflow run: ${lastWorkflowRun.html_url} - ${lastWorkflowRun.status}`
      );

      return {
        statusCode: 200,
        body: `{
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*FroBot is now building...* \n\nWorkflow Link: ${lastWorkflowRun.html_url}"
                },
                "accessory": {
                  "type": "image",
                  "image_url": "https://i.ibb.co/MpvbWcb/ezgif-6-8f0882297a.jpg",
                  "alt_text": "FroBot building staging and dev-client apps."
                }
              }
            ]
          }`,
      };
    }

    return {
      statusCode: 200,
      body: "*FroBot is now building...*\n\nWorkflow Link: https://github.com/readyfastcode/foodready-mobile/actions/workflows/manual-staging-build.yml",
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
