const { withRetry } = require("./retry");

module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo;
  const pull_number = context.issue.number;

  await withRetry(core, "Approve", async () => {
    // Skip if we already approved the current head (e.g. on retry or re-run)
    const { data: pr } = await github.rest.pulls.get({ owner, repo, pull_number });
    const reviews = await github.paginate(github.rest.pulls.listReviews, { owner, repo, pull_number });
    if (reviews.some((r) => r.state === "APPROVED" && r.commit_id === pr.head.sha)) {
      core.info("Already approved, skipping");
      return;
    }
    await github.rest.pulls.createReview({ owner, repo, pull_number, event: "APPROVE" });
  });
};
