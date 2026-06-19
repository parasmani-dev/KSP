# Workspace Rules

## General Guidelines
1. **No Mock Data**: NEVER work on mock data. If data is needed for an implementation and is not available in the project, explicitly ask the user for what is needed to proceed. Do not use mock data even if external ideation plans suggest doing so.
2. **Single Feature Focus**: NEVER work on 2 features simultaneously. Always work on features sequentially, one by one.
3. **Strict PR Self-Review**: Before asking the user to create a PR or finishing a feature branch, ALWAYS perform a comprehensive self-review. Check for:
   - **PII Leaks**: Ensure no real phone numbers or PII exist in the data/code.
   - **Dataset Filenames**: Ensure all CSV dataset reads use the `*_sample.csv` naming convention.
   - **Geographic Hardcoding**: NEVER hardcode specific cities (like Bengaluru). All mapping and logic MUST be dynamic to support multi-city datasets.
