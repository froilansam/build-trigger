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
  const channel = "C06FHJZ2Q0H";

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

  await octokit.request(
    "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
    {
      owner: "readyfastcode",
      repo: "foodready-mobile",
      workflow_id: "89219970",
      ref: "master",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  await web.chat.postMessage({
    channel: channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*FroBot is now building Staging and Dev-client Apps* \n\nWorkflows Link: https://github.com/readyfastcode/foodready-mobile/actions/workflows/manual-staging-build.yml`,
        },
        accessory: {
          type: "image",
          image_url: "https://i.ibb.co/MpvbWcb/ezgif-6-8f0882297a.jpg",
          alt_text: "FroBot building staging and dev-client apps.",
        },
      },
    ],
  });

  return {
    statusCode: 200,
  };
};
