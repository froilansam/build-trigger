const { Octokit } = require("octokit");
const { WebClient } = require("@slack/web-api");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token = process.env.GITHUB_TOKEN;
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const web = new WebClient(slackToken);
  const channel = "C06QPFQKTSQ";

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

  await octokit.request(
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

  res.send({
    statusCode: 200,
  });

  await delay(2000);

  const workflowRuns = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
    {
      owner: "readyfastcode",
      repo: "foodready-mobile",
      workflow_id: "89219970",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (workflowRuns.data.workflow_runs?.length) {
    const lastWorkflowRun = workflowRuns.data.workflow_runs[0];
    console.log(
      `Last workflow run: ${lastWorkflowRun.html_url} - ${lastWorkflowRun.status}`
    );

    await web.chat.postMessage({
      channel: channel,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*FroBot is now building Staging and Dev-client Apps* \n\nWorkflow Link: ${lastWorkflowRun.html_url}`,
          },
          accessory: {
            type: "image",
            image_url: "https://i.ibb.co/MpvbWcb/ezgif-6-8f0882297a.jpg",
            alt_text: "FroBot building staging and dev-client apps.",
          },
        },
      ],
    });
  } else {
    await web.chat.postMessage({
      channel: channel,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*FroBot is now building Staging and Dev-client Apps* \n\nWorkflow Link: https://github.com/readyfastcode/foodready-mobile/actions/workflows/manual-staging-build.yml`,
          },
          accessory: {
            type: "image",
            image_url: "https://i.ibb.co/MpvbWcb/ezgif-6-8f0882297a.jpg",
            alt_text: "FroBot building staging and dev-client apps.",
          },
        },
      ],
    });
  }
};
