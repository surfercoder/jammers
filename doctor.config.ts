import { defineConfig } from "react-doctor/api";

export default defineConfig({
  // Fail the run (non-zero exit) on warnings as well as errors, so
  // `npm run react-doctor` only passes at a clean 100/100. Application
  // source carries no suppressions — every diagnostic is fixed at the source.
  blocking: "warning",
  ignore: {
    // Test scaffolding (Jest mocks + shared helpers) is a toolkit, not shipped
    // app code: its "unused export" signals are false for an audit of app
    // health, so we filter diagnostics for those paths post-lint.
    overrides: [{ files: ["test/**", "__mocks__/**"] }],
  },
});
