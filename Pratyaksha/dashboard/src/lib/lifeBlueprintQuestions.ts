// Life Blueprint Questions - Guided reflection prompts
// Organized by category and time horizon

// ==================== TYPES ====================

export interface ReflectionQuestion {
  id: string;
  question: string;
  followUp?: string; // Deeper probe
  examples?: string[]; // Anchor examples
  placeholder?: string;
}

export interface CategoryQuestions {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  visionQuestions: ReflectionQuestion[];
  antiVisionQuestions: ReflectionQuestion[];
  leverQuestions: ReflectionQuestion[];
}

export interface TimeHorizon {
  id: "6months" | "1year" | "3years" | "5years" | "10years";
  label: string;
  description: string;
  color: string;
  questions: ReflectionQuestion[];
}

// ==================== VISION CATEGORIES ====================

export const LIFE_CATEGORIES: CategoryQuestions[] = [
  {
    id: "career",
    name: "Career & Purpose",
    icon: "Briefcase",
    color: "blue",
    description: "Work, impact, and professional fulfillment",
    visionQuestions: [
      {
        id: "career-v1",
        question: "What does meaningful work look like for you?",
        followUp: "Not just the title, but how it feels day-to-day",
        examples: ["Building products people love", "Teaching and mentoring", "Solving hard problems"],
        placeholder: "Work that lets me..."
      },
      {
        id: "career-v2",
        question: "What would you do if money wasn't a concern?",
        followUp: "This reveals your true calling",
        placeholder: "I would spend my time..."
      },
      {
        id: "career-v3",
        question: "What impact do you want your work to have?",
        examples: ["Help 1M people", "Change an industry", "Create generational wealth"],
        placeholder: "Through my work, I want to..."
      },
    ],
    antiVisionQuestions: [
      {
        id: "career-av1",
        question: "What work situation would you dread waking up to?",
        examples: ["Meaningless busywork", "Toxic boss", "No growth", "Golden handcuffs"],
        placeholder: "I never want to..."
      },
      {
        id: "career-av2",
        question: "What career regret do you want to avoid at 70?",
        followUp: "Think about your future self looking back",
        placeholder: "I don't want to look back and wish I had..."
      },
    ],
    leverQuestions: [
      {
        id: "career-l1",
        question: "What single habit most impacts your work quality?",
        examples: ["Deep work blocks", "Saying no to meetings", "Morning routine"],
        placeholder: "When I consistently..."
      },
      {
        id: "career-l2",
        question: "What skill, if mastered, would 10x your career?",
        placeholder: "If I became great at..."
      },
    ],
  },
  {
    id: "health",
    name: "Health & Energy",
    icon: "Heart",
    color: "red",
    description: "Physical vitality, mental clarity, longevity",
    visionQuestions: [
      {
        id: "health-v1",
        question: "What does your ideal physical state feel like?",
        followUp: "Not just how you look, but how you feel",
        examples: ["Boundless energy", "Strong and capable", "Clear mind", "Deep sleep"],
        placeholder: "I want to feel..."
      },
      {
        id: "health-v2",
        question: "What do you want to still be doing at 80?",
        examples: ["Playing with grandkids", "Hiking mountains", "Sharp mind for conversations"],
        placeholder: "At 80, I want to be able to..."
      },
    ],
    antiVisionQuestions: [
      {
        id: "health-av1",
        question: "What health outcome terrifies you most?",
        followUp: "Use this fear as fuel, not paralysis",
        examples: ["Chronic disease", "Mental decline", "Dependency on others"],
        placeholder: "I want to avoid..."
      },
      {
        id: "health-av2",
        question: "What unhealthy pattern are you most at risk of falling into?",
        examples: ["Stress eating", "Neglecting sleep", "Sedentary lifestyle"],
        placeholder: "My biggest health risk is..."
      },
    ],
    leverQuestions: [
      {
        id: "health-l1",
        question: "What one habit would transform your energy?",
        examples: ["8 hours sleep", "Daily movement", "No alcohol", "Morning sunlight"],
        placeholder: "If I consistently..."
      },
      {
        id: "health-l2",
        question: "What triggers your worst health decisions?",
        examples: ["Stress", "Travel", "Social pressure", "Boredom"],
        placeholder: "I make poor health choices when..."
      },
    ],
  },
  {
    id: "relationships",
    name: "Relationships",
    icon: "Users",
    color: "pink",
    description: "Family, friends, love, community",
    visionQuestions: [
      {
        id: "rel-v1",
        question: "What does your ideal family life look like?",
        followUp: "Think daily rhythms, not just milestones",
        examples: ["Present parent", "Weekly family dinners", "Strong marriage"],
        placeholder: "My ideal family life includes..."
      },
      {
        id: "rel-v2",
        question: "What kind of friend do you want to be?",
        examples: ["The one who shows up", "Deep conversations", "Adventure partner"],
        placeholder: "As a friend, I want to be..."
      },
      {
        id: "rel-v3",
        question: "What relationship would transform your life if deeper?",
        placeholder: "If I invested more in my relationship with..."
      },
    ],
    antiVisionQuestions: [
      {
        id: "rel-av1",
        question: "What relationship regret would haunt you?",
        examples: ["Missing kids' childhood", "Drifting from spouse", "No deep friendships"],
        placeholder: "I never want to..."
      },
      {
        id: "rel-av2",
        question: "What pattern damages your relationships?",
        examples: ["Work obsession", "Phone addiction", "Emotional unavailability"],
        placeholder: "I damage relationships when I..."
      },
    ],
    leverQuestions: [
      {
        id: "rel-l1",
        question: "What small daily action would strengthen your key relationships?",
        examples: ["Phone-free dinners", "Weekly date night", "Daily check-in text"],
        placeholder: "If I did this daily..."
      },
    ],
  },
  {
    id: "finance",
    name: "Financial",
    icon: "DollarSign",
    color: "green",
    description: "Money, security, freedom, abundance",
    visionQuestions: [
      {
        id: "fin-v1",
        question: "What does financial freedom mean to you specifically?",
        followUp: "A number without meaning is just a number",
        examples: ["Never worry about bills", "Quit anytime", "Generational wealth"],
        placeholder: "Financial freedom means..."
      },
      {
        id: "fin-v2",
        question: "What would you do differently if you had 10x your current wealth?",
        followUp: "This reveals what money represents to you",
        placeholder: "With 10x wealth, I would..."
      },
    ],
    antiVisionQuestions: [
      {
        id: "fin-av1",
        question: "What financial situation keeps you up at night?",
        examples: ["Can't retire", "Burden on kids", "One emergency away from crisis"],
        placeholder: "My financial fear is..."
      },
      {
        id: "fin-av2",
        question: "What money mistake do you keep repeating?",
        examples: ["Lifestyle creep", "Not investing", "Emotional spending"],
        placeholder: "I keep making the mistake of..."
      },
    ],
    leverQuestions: [
      {
        id: "fin-l1",
        question: "What one financial habit would change everything?",
        examples: ["Auto-invest 20%", "Track every expense", "Weekly money date"],
        placeholder: "If I consistently..."
      },
    ],
  },
  {
    id: "growth",
    name: "Personal Growth",
    icon: "TrendingUp",
    color: "purple",
    description: "Learning, wisdom, becoming who you want to be",
    visionQuestions: [
      {
        id: "growth-v1",
        question: "Who do you want to become?",
        followUp: "Not what you want to have, but who you want to BE",
        examples: ["Calm under pressure", "Deeply wise", "Courageously authentic"],
        placeholder: "I want to become someone who..."
      },
      {
        id: "growth-v2",
        question: "What would the ideal version of you do differently today?",
        placeholder: "The best version of me would..."
      },
      {
        id: "growth-v3",
        question: "What skill or knowledge would unlock new possibilities?",
        examples: ["Public speaking", "Writing", "Leadership", "Technical skill"],
        placeholder: "Learning this would change everything..."
      },
    ],
    antiVisionQuestions: [
      {
        id: "growth-av1",
        question: "What personal weakness could derail your life if unchecked?",
        examples: ["Procrastination", "Conflict avoidance", "Ego", "Impatience"],
        placeholder: "If I don't address my..."
      },
      {
        id: "growth-av2",
        question: "What limiting belief holds you back most?",
        examples: ["I'm not smart enough", "It's too late", "I don't deserve success"],
        placeholder: "I hold myself back by believing..."
      },
    ],
    leverQuestions: [
      {
        id: "growth-l1",
        question: "What daily practice would accelerate your growth?",
        examples: ["Journaling", "Reading", "Meditation", "Deliberate practice"],
        placeholder: "If I spent 30 min daily on..."
      },
    ],
  },
  {
    id: "lifestyle",
    name: "Lifestyle & Freedom",
    icon: "Home",
    color: "orange",
    description: "How you spend your days, where you live, daily joy",
    visionQuestions: [
      {
        id: "life-v1",
        question: "Describe your ideal ordinary Tuesday",
        followUp: "Not vacation, but a regular day in your dream life",
        placeholder: "My ideal Tuesday looks like..."
      },
      {
        id: "life-v2",
        question: "Where and how do you want to live?",
        examples: ["City energy", "Nature access", "Global nomad", "Community roots"],
        placeholder: "I want to live..."
      },
      {
        id: "life-v3",
        question: "What experiences do you want to have before you die?",
        placeholder: "Before I die, I want to..."
      },
    ],
    antiVisionQuestions: [
      {
        id: "life-av1",
        question: "What lifestyle trap are you at risk of falling into?",
        examples: ["Hedonic treadmill", "Keeping up appearances", "All work no play"],
        placeholder: "I could easily end up..."
      },
    ],
    leverQuestions: [
      {
        id: "life-l1",
        question: "What boundary would protect your ideal lifestyle?",
        examples: ["No work after 6pm", "One trip per quarter", "Weekly adventure day"],
        placeholder: "To protect my lifestyle, I need to..."
      },
    ],
  },
];

// ==================== TIME HORIZONS ====================

export const TIME_HORIZONS: TimeHorizon[] = [
  {
    id: "6months",
    label: "6 Months",
    description: "What's the ONE thing that would make the next 6 months a win?",
    color: "sky",
    questions: [
      {
        id: "6m-1",
        question: "If you could only accomplish ONE thing in 6 months, what would make everything else easier or unnecessary?",
        followUp: "Think domino effect - what tips over other goals?",
        placeholder: "The ONE thing is..."
      },
      {
        id: "6m-2",
        question: "What habit, if built in 6 months, would compound forever?",
        examples: ["Daily exercise", "Writing habit", "Deep work blocks"],
        placeholder: "The habit I'll build is..."
      },
      {
        id: "6m-3",
        question: "What must you STOP doing to make room for what matters?",
        placeholder: "I need to stop..."
      },
    ],
  },
  {
    id: "1year",
    label: "1 Year",
    description: "What would make this year the turning point?",
    color: "emerald",
    questions: [
      {
        id: "1y-1",
        question: "One year from now, what would make you say 'That was the year everything changed'?",
        placeholder: "This year changes everything if..."
      },
      {
        id: "1y-2",
        question: "What project, if completed this year, would you be proud of for decades?",
        placeholder: "The project is..."
      },
      {
        id: "1y-3",
        question: "What relationship will you transform this year?",
        placeholder: "I will transform my relationship with..."
      },
      {
        id: "1y-4",
        question: "What fear will you face this year?",
        placeholder: "This year I will face..."
      },
    ],
  },
  {
    id: "3years",
    label: "3 Years",
    description: "The horizon where bold moves pay off",
    color: "amber",
    questions: [
      {
        id: "3y-1",
        question: "Where do you want to be living and working in 3 years?",
        placeholder: "In 3 years, I'm..."
      },
      {
        id: "3y-2",
        question: "What would your career look like if you played to win, not to avoid losing?",
        followUp: "Remove the safety mindset",
        placeholder: "Playing to win, in 3 years I would..."
      },
      {
        id: "3y-3",
        question: "What asset (skill, business, investment) do you want to have built?",
        placeholder: "In 3 years I'll have built..."
      },
    ],
  },
  {
    id: "5years",
    label: "5 Years",
    description: "Where big visions become reality",
    color: "violet",
    questions: [
      {
        id: "5y-1",
        question: "Describe your life in 5 years in vivid detail - morning routine, work, relationships, health",
        placeholder: "In 5 years, my typical day..."
      },
      {
        id: "5y-2",
        question: "What would you attempt if you knew you couldn't fail?",
        placeholder: "If I couldn't fail, I would..."
      },
      {
        id: "5y-3",
        question: "Who do you need to become to achieve your 5-year vision?",
        followUp: "Identity precedes outcomes",
        placeholder: "I need to become someone who..."
      },
    ],
  },
  {
    id: "10years",
    label: "10 Years",
    description: "Legacy thinking - what will matter?",
    color: "rose",
    questions: [
      {
        id: "10y-1",
        question: "What do you want to be known for?",
        placeholder: "I want to be known as someone who..."
      },
      {
        id: "10y-2",
        question: "What would you regret NOT trying?",
        followUp: "The pain of regret outlasts the pain of failure",
        placeholder: "I would regret not..."
      },
      {
        id: "10y-3",
        question: "What do you want to have given or contributed to the world?",
        placeholder: "My contribution will be..."
      },
    ],
  },
];

// ==================== OPENING QUESTIONS ====================

// Deep anchoring questions to start the blueprint
export const OPENING_QUESTIONS: ReflectionQuestion[] = [
  {
    id: "open-1",
    question: "Imagine you're 85, looking back on your life. What would make you say 'I lived well'?",
    followUp: "Don't think achievements - think feelings and experiences",
    placeholder: "A life well-lived means..."
  },
  {
    id: "open-2",
    question: "What does your gut tell you that you're ignoring?",
    followUp: "We often know the answer but fear it",
    placeholder: "Deep down, I know I should..."
  },
  {
    id: "open-3",
    question: "If you had to bet your life on one thing working out, what would you bet on?",
    placeholder: "I would bet everything on..."
  },
];

// ==================== FEAR/ANTI-VISION QUESTIONS ====================

export const FEAR_QUESTIONS: ReflectionQuestion[] = [
  {
    id: "fear-1",
    question: "What's the life you're terrified of ending up in?",
    followUp: "Be specific - this fear is useful fuel",
    placeholder: "My nightmare scenario is..."
  },
  {
    id: "fear-2",
    question: "What's your biggest 'I don't want to become like...' example?",
    placeholder: "I never want to become like..."
  },
  {
    id: "fear-3",
    question: "What would your life look like if you kept all your bad habits for 10 more years?",
    followUp: "Project the trajectory honestly",
    placeholder: "If nothing changes, in 10 years I'll be..."
  },
];

// ==================== HELPER ====================

export function getQuestionById(id: string): ReflectionQuestion | undefined {
  // Search all question arrays
  for (const cat of LIFE_CATEGORIES) {
    const found = [...cat.visionQuestions, ...cat.antiVisionQuestions, ...cat.leverQuestions]
      .find(q => q.id === id);
    if (found) return found;
  }

  for (const horizon of TIME_HORIZONS) {
    const found = horizon.questions.find(q => q.id === id);
    if (found) return found;
  }

  return OPENING_QUESTIONS.find(q => q.id === id) ||
         FEAR_QUESTIONS.find(q => q.id === id);
}
