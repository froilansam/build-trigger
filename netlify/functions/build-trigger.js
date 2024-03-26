const { Octokit } = require("octokit");
const { WebClient } = require("@slack/web-api");

function parseQueryStringToJSON(str) {
  const queryParams = str.split("&");
  let result = {};

  queryParams.forEach((param) => {
    let [key, value] = param.split("=");
    // Use decodeURIComponent to decode URI components.
    key = decodeURIComponent(key);
    value = decodeURIComponent(value);
    result[key] = value;
  });

  return result;
}

async function checkBranchExists(branch) {
  const token = process.env.GITHUB_TOKEN;
  const owner = "readyfastcode";
  const repo = "foodready-mobile";

  const octokit = new Octokit({
    auth: token,
  });

  try {
    await octokit.request("GET /repos/{owner}/{repo}/branches/{branch}", {
      owner,
      repo,
      branch,
    });
    // If the request is successful, the branch exists
    console.log(`Branch "${branch}" exists in ${owner}/${repo}`);
    return true;
  } catch (error) {
    // If the branch does not exist, GitHub API will return a 404 error
    if (error.status === 404) {
      console.log(`Branch "${branch}" does not exist in ${owner}/${repo}`);
    } else {
      // Other errors (e.g., network issues, authentication problems)
      console.error("Error:", error);
    }
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  let ref = "master";
  const text = parseQueryStringToJSON(event.body)?.text;

  if (text) {
    const isExisting = await checkBranchExists(text);
    if (isExisting) ref = text;
  }

  console.log("Ref:", ref);

  return;

  const token = process.env.GITHUB_TOKEN;
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const web = new WebClient(slackToken);
  const channel = "C06FHJZ2Q0H";

  const octokit = new Octokit({
    auth: token,
  });

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
