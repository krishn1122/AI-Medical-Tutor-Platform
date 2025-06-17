
export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  category: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const medicalQuestions: MCQQuestion[] = [
  {
    id: 'q1',
    question: 'A 45-year-old patient presents with chest pain that worsens with deep inspiration and is relieved when leaning forward. What is the most likely diagnosis?',
    options: [
      { id: 'a', text: 'Myocardial infarction', isCorrect: false },
      { id: 'b', text: 'Pericarditis', isCorrect: true },
      { id: 'c', text: 'Pneumonia', isCorrect: false },
      { id: 'd', text: 'Gastroesophageal reflux', isCorrect: false }
    ],
    category: 'cardiology',
    explanation: 'Pericarditis typically presents with chest pain that is pleuritic (worsens with inspiration) and positional (improves when leaning forward). This distinguishes it from myocardial infarction, which usually presents with crushing chest pain not affected by position or breathing.',
    difficulty: 'intermediate'
  },
  {
    id: 'q2',
    question: 'Which of the following is the first-line treatment for acute anaphylaxis?',
    options: [
      { id: 'a', text: 'Corticosteroids', isCorrect: false },
      { id: 'b', text: 'Antihistamines', isCorrect: false },
      { id: 'c', text: 'Epinephrine', isCorrect: true },
      { id: 'd', text: 'Beta-agonist inhalers', isCorrect: false }
    ],
    category: 'emergency_medicine',
    explanation: 'Epinephrine is the first-line treatment for anaphylaxis. It should be administered immediately via intramuscular injection, typically in the anterolateral thigh. While corticosteroids and antihistamines may be used as adjunctive therapy, epinephrine is the only medication that can rapidly reverse the life-threatening symptoms of anaphylaxis.',
    difficulty: 'beginner'
  },
  {
    id: 'q3',
    question: 'A patient with diabetes mellitus type 2 has an HbA1c of 8.5%. What does this indicate about their glucose control over the past 2-3 months?',
    options: [
      { id: 'a', text: 'Excellent control', isCorrect: false },
      { id: 'b', text: 'Good control', isCorrect: false },
      { id: 'c', text: 'Poor control', isCorrect: true },
      { id: 'd', text: 'Cannot determine from this value alone', isCorrect: false }
    ],
    category: 'endocrinology',
    explanation: 'An HbA1c of 8.5% indicates poor glycemic control. The target HbA1c for most adults with diabetes is <7%. Values above 8% suggest that glucose levels have been consistently elevated over the past 2-3 months, indicating the need for intensification of diabetes management.',
    difficulty: 'beginner'
  },
  {
    id: 'q4',
    question: 'Which cranial nerve is primarily responsible for facial sensation?',
    options: [
      { id: 'a', text: 'Cranial nerve V (Trigeminal)', isCorrect: true },
      { id: 'b', text: 'Cranial nerve VII (Facial)', isCorrect: false },
      { id: 'c', text: 'Cranial nerve III (Oculomotor)', isCorrect: false },
      { id: 'd', text: 'Cranial nerve X (Vagus)', isCorrect: false }
    ],
    category: 'neurology',
    explanation: 'The trigeminal nerve (cranial nerve V) is responsible for facial sensation through its three divisions: ophthalmic, maxillary, and mandibular. The facial nerve (VII) is primarily responsible for facial muscle movement, not sensation.',
    difficulty: 'beginner'
  },
  {
    id: 'q5',
    question: 'A 28-year-old woman presents with fatigue, weight loss, and heat intolerance. Lab results show low TSH and elevated T3 and T4. What is the most likely diagnosis?',
    options: [
      { id: 'a', text: 'Hypothyroidism', isCorrect: false },
      { id: 'b', text: 'Hyperthyroidism', isCorrect: true },
      { id: 'c', text: 'Diabetes mellitus', isCorrect: false },
      { id: 'd', text: 'Adrenal insufficiency', isCorrect: false }
    ],
    category: 'endocrinology',
    explanation: 'The combination of low TSH with elevated T3 and T4 indicates primary hyperthyroidism. The symptoms of fatigue, weight loss, and heat intolerance are classic for hyperthyroidism. In this condition, the thyroid gland produces excess hormones, leading to suppression of TSH through negative feedback.',
    difficulty: 'intermediate'
  }
];

export const getRandomQuestions = (count: number = 10): MCQQuestion[] => {
  const shuffled = [...medicalQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, medicalQuestions.length));
};

export const getQuestionsByCategory = (category: string): MCQQuestion[] => {
  return medicalQuestions.filter(q => q.category === category);
};
