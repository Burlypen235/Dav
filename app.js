const levelEl = document.getElementById('studyLevel');
const subjectEl = document.getElementById('subject');
const topicEl = document.getElementById('topic');
const numQuestionsEl = document.getElementById('numQuestions');
const difficultyEl = document.getElementById('difficulty');
const withAnswersEl = document.getElementById('withAnswers');
const outputEl = document.getElementById('output');

const promptsByLevel = {
  'Primary School': [
    'Define {topic} in one short sentence.',
    'Give one daily-life example of {topic}.',
    'Fill in the blank about {topic}.',
    'Circle the correct answer about {topic}.',
    'Match the terms related to {topic}.'
  ],
  'Middle School': [
    'Explain the main idea of {topic}.',
    'Solve this short problem related to {topic}.',
    'Compare two concepts in {topic}.',
    'Choose the correct statement about {topic}.',
    'Write two facts about {topic}.'
  ],
  'High School': [
    'Analyze the concept of {topic} with one example.',
    'Solve a multi-step question on {topic}.',
    'Evaluate a claim about {topic}.',
    'Differentiate between key methods used in {topic}.',
    'Apply {topic} to a real-world scenario.'
  ],
  Undergraduate: [
    'Critically discuss the foundations of {topic}.',
    'Apply a formal method to solve a question on {topic}.',
    'Interpret a data-based scenario involving {topic}.',
    'Assess limitations of one approach in {topic}.',
    'Propose a practical application of {topic}.'
  ],
  Postgraduate: [
    'Synthesize major theories connected to {topic}.',
    'Design an advanced problem-solving strategy for {topic}.',
    'Critique competing viewpoints in {topic}.',
    'Formulate a research-level question based on {topic}.',
    'Develop an evidence-backed argument about {topic}.'
  ]
};

function pickDifficultyTag(index, total, blend) {
  if (blend === 'easy') return index < Math.ceil(total * 0.7) ? 'Easy' : 'Medium';
  if (blend === 'hard') return index < Math.ceil(total * 0.3) ? 'Medium' : 'Hard';
  const split1 = Math.ceil(total * 0.4);
  const split2 = Math.ceil(total * 0.8);
  if (index < split1) return 'Easy';
  if (index < split2) return 'Medium';
  return 'Hard';
}

function generateTest() {
  const level = levelEl.value;
  const subject = subjectEl.value.trim();
  const topic = topicEl.value.trim();
  const total = Number(numQuestionsEl.value);

  if (!subject || !topic) {
    outputEl.textContent = 'Please enter both subject and topic.';
    return;
  }

  const templates = promptsByLevel[level];
  const lines = [];
  lines.push('STUDENT TEST PAPER');
  lines.push(`Level: ${level}`);
  lines.push(`Subject: ${subject}`);
  lines.push(`Topic: ${topic}`);
  lines.push(`Total Questions: ${total}`);
  lines.push(`Difficulty: ${difficultyEl.value}`);
  lines.push('');

  const answers = [];

  for (let i = 0; i < total; i += 1) {
    const base = templates[i % templates.length].replaceAll('{topic}', topic);
    const tag = pickDifficultyTag(i, total, difficultyEl.value);
    lines.push(`${i + 1}. [${tag}] ${base}`);
    answers.push(`${i + 1}. Sample answer should reference core ${subject} principles of ${topic} at ${level} depth.`);
  }

  if (withAnswersEl.value === 'yes') {
    lines.push('');
    lines.push('ANSWER KEY (GUIDE)');
    lines.push(...answers);
  }

  outputEl.textContent = lines.join('\n');
}

function copyOutput() {
  navigator.clipboard.writeText(outputEl.textContent)
    .then(() => alert('Generated test copied to clipboard.'))
    .catch(() => alert('Copy failed. Please copy manually.'));
}

function downloadOutput() {
  const blob = new Blob([outputEl.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanSubject = (subjectEl.value.trim() || 'test').replace(/\s+/g, '-').toLowerCase();
  a.href = url;
  a.download = `${cleanSubject}-test.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('generateBtn').addEventListener('click', generateTest);
document.getElementById('copyBtn').addEventListener('click', copyOutput);
document.getElementById('downloadBtn').addEventListener('click', downloadOutput);
