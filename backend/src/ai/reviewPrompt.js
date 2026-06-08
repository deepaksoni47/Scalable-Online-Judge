/**
 * Truncates code to prevent excessively large prompts, protecting Gemini token usage/costs.
 */
const truncateCode = (code, maxLength = 8000) => {
  if (!code) return "";
  if (code.length <= maxLength) return code;
  return (
    code.substring(0, maxLength) +
    "\n\n/* ... [Code truncated by AI Review system to fit token limits] ... */"
  );
};

/**
 * Builds the structured prompt for the Gemini AI review.
 */
const buildReviewPrompt = ({ problem, code, language }) => {
  const truncatedCode = truncateCode(code);
  const problemTitle = problem.title || "Untitled Problem";
  const problemStatement = problem.statement || "No statement provided.";
  const constraints = problem.constraints || "No constraints specified.";

  return `You are a "Senior Software Engineer and Competitive Programming Reviewer".
Review the user's submitted code for the following competitive programming problem.

### PROBLEM DETAILS
Title: ${problemTitle}
Statement:
${problemStatement}

Constraints:
${constraints}

### USER'S CODE SUBMISSION
Language: ${language}
Code:
\`\`\`${language}
${truncatedCode}
\`\`\`

### YOUR INSTRUCTIONS
Please analyze the code carefully and write a highly professional review. Address the following key areas in depth:
1. Correctness: Does the code correctly solve the problem? Are there any potential logic errors, edge cases that fail, infinite loops, or runtime crashes?
2. Logic Issues: Point out any specific flaws in the logic, loops, or condition handling.
3. Edge Cases: Identify missing edge cases (e.g., empty inputs, negative numbers, overflow limits, extreme values).
4. Time Complexity: Provide the time complexity in Big O notation (e.g., O(N), O(N log N)) and explain why.
5. Space Complexity: Provide the space complexity in Big O notation (e.g., O(1), O(N)) and explain why.
6. Code Quality: Analyze readability, naming conventions, structure, and best practices.
7. Optimization Suggestions: Suggest improvements, better algorithms, or memory optimizations.

### FORMATTING REQUIREMENTS
You must reply only in valid Markdown format. Use the following exact structure (you can use subheaders under these sections as needed):

# Overall Review
[Provide a summary of the implementation and whether it's optimal]

## Correctness & Logic Issues
[Details on correctness, logic issues, bugs, infinite loops]

## Edge Cases
[Details on handled or missing edge cases]

## Time Complexity
[Big O notation and justification]

## Space Complexity
[Big O notation and justification]

## Code Quality
[Feedback on code quality and best practices]

## Suggested Improvements & Optimizations
[Actionable suggestions, better algorithms, memory optimizations, or corrected snippets]
`;
};

module.exports = {
  buildReviewPrompt,
  truncateCode,
};
