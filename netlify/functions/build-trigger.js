const { Octokit } = require("@octokit/core");
const { WebClient } = require("@slack/web-api");

function parseQueryStringToJSON(str) {
  return str.split("&").reduce((result, param) => {
    let [key, value] = param.split("=");
    result[decodeURIComponent(key)] = decodeURIComponent(value);
    return result;
  }, {});
}

async function dispatchWorkflow(ref) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const workflowId = "89219970";
  const owner = "readyfastcode";
  const repo = "foodready-mobile";

  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
      {
        owner,
        repo,
        workflow_id: workflowId,
        ref,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      }
    );
    return true;
  } catch (err) {
    console.error(`Error dispatching workflow for ref ${ref}: ${err}`);
    return false;
  }
}

async function postMessageToSlack(ref) {
  const web = new WebClient(process.env.SLACK_BOT_TOKEN);
  const channel = "C06FHJZ2Q0H";
  await web.chat.postMessage({
    channel: channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*FroBot is now building Staging and Dev-client Apps ${
            ref !== "master" ? `based on ${ref} branch` : ""
          }* \n\nWorkflows Link: https://github.com/readyfastcode/foodready-mobile/actions/workflows/manual-staging-build.yml`,
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

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = parseQueryStringToJSON(event.body);
  let ref = body?.text || "master";

  const success = await dispatchWorkflow(ref);

  if (!success) {
    ref = "master";
    await dispatchWorkflow(ref); // Fallback to master branch if initial dispatch fails
  }

  await postMessageToSlack(ref);

  return {
    statusCode: 200,
  };
};
