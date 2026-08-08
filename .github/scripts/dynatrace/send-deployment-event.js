const { EventsClient } = require("@dynatrace-sdk/client-classic-environment-v2");
const { QueryExecutionClient } = require("@dynatrace-sdk/client-query");
const { PlatformHttpClient } = require("@dynatrace-sdk/http-client");

const DQL_QUERY = `smartscapeNodes "SERVICE"
| filter matchesPattern(name, """'image-provider' LD 'in' LD """)
| fields id, name, id_classic`;

const QUERY_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 2_000;
const MAX_POLLS = 15;
const STAGING_OR_PROD_ENVS = new Set([
  "staging",
  "playground-staging",
  "playground",
  "live",
  "live3gen",
]);

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeUrl(url) {
  // remove trailing slash
  return url.replace(/\/+$/, "");
}

async function queryService(queryClient) {
  let response = await queryClient.queryExecute({
    body: {
      query: DQL_QUERY,
      requestTimeoutMilliseconds: QUERY_TIMEOUT_MS,
    },
  });

  for (let attempt = 1; response.state !== "SUCCEEDED" && attempt <= MAX_POLLS; attempt += 1) {
    if (["FAILED", "CANCELLED", "RESULT_GONE"].includes(response.state)) {
      throw new Error(`DQL query ended with state ${response.state}`);
    }

    if (!response.requestToken) {
      throw new Error(`DQL query did not return results or a request token: ${JSON.stringify(response)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    response = await queryClient.queryPoll({
      requestToken: response.requestToken,
      requestTimeoutMilliseconds: QUERY_TIMEOUT_MS,
    });
  }

  if (response.state !== "SUCCEEDED") {
    throw new Error(`DQL query did not finish after ${MAX_POLLS} polls`);
  }

  const records = response.result?.records ?? [];
  if (records.length !== 1) {
    throw new Error(`Expected exactly one service from DQL query, got ${records.length}: ${JSON.stringify(records)}`);
  }

  const service = records[0];
  if (!service.id) {
    throw new Error(`DQL query result does not include a service id: ${JSON.stringify(service)}`);
  }

  return service;
}

function buildProperties(service) {
  const deployEnv = requireEnv("DEPLOY_ENV");
  const repository = requireEnv("GITHUB_REPOSITORY");
  const sha = requireEnv("GITHUB_SHA");
  const properties = {
    source: "GitHub",
    "event.description": `Image processing problem trigger from [PR](https://github.com/${repository}/commit/${sha})`,
    "github.repository": repository,
    "github.ref": requireEnv("GITHUB_REF"),
    "github.event_name": requireEnv("GITHUB_EVENT_NAME"),
    "github.commit": sha,
    "terraform.outcome": requireEnv("TERRAFORM_OUTCOME"),
    "dt.smartscape_source.id": service.id,
    "dt.smartscape_source.type": "SERVICE",
  };

  if (STAGING_OR_PROD_ENVS.has(deployEnv)) {
    properties["dt.source_entity"] = service.id;
  }

  return properties;
}

async function main() {
  const baseUrl = normalizeUrl(requireEnv("DT_URL"));
  const token = requireEnv("DT_TOKEN");
  const httpClient = new PlatformHttpClient({
    baseUrl,
    defaultHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  const service = await queryService(new QueryExecutionClient(httpClient));
  const result = await new EventsClient(httpClient).createEvent({
    body: {
      eventType: "CUSTOM_DEPLOYMENT",
      title: `Github Actions for ${requireEnv("GITHUB_WORKFLOW")}`,
      properties: buildProperties(service),
    },
  });

  console.log(`Sent Dynatrace deployment event for service ${service.id}`);
  console.log(JSON.stringify(result));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
