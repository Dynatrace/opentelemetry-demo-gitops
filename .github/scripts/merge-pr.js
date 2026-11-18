const { withRetry } = require("./retry");

module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo;
  const pull_number = context.issue.number;

  await withRetry(
    core,
    "Merge",
    () => github.rest.pulls.merge({ owner, repo, pull_number, merge_method: "squash" }),
    {
      // A 5xx may have actually merged server-side; if so, we're done.
      onError: async (e) => {
        const { data: pr } = await github.rest.pulls.get({ owner, repo, pull_number });
        if (pr.merged) {
          core.info(`PR already merged despite error (${e.status}), done`);
          return true;
        }
        return false;
      },
    }
  );
};
