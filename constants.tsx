
import { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "Level 1: The Unseen Foundation",
    description: "Master the undefined terms: Point, Line, and Plane.",
    xpValue: 100,
    unlocked: true,
    completed: false,
    slides: [
      {
        title: "The Undefined Terms",
        content: "In geometry, some terms are so basic that we don't define them with other words. They are the 'atoms' of math.",
        diagram: "point-line-plane",
        bullets: [
          "Point: A location with no size.",
          "Line: A straight path that extends forever in two directions.",
          "Plane: A flat surface that extends forever."
        ]
      },
      {
        title: "Why 'Undefined'?",
        content: "We use these to define everything else. For example, a segment is part of a line. Without 'Line', we can't have 'Segment'!",
        diagram: "segment-derivation"
      }
    ],
    quiz: [
      {
        id: 1,
        text: "Which of the following is an example of an undefined term?",
        options: ["Equiangular", "Parallel", "Line", "Square"],
        correctAnswer: 2,
        explanation: "Point, Line, and Plane are the three undefined terms in geometry."
      }
    ]
  },
  {
    id: 2,
    title: "Level 2: Rays & Angles",
    description: "Learn how rays combine to form angles.",
    xpValue: 150,
    unlocked: false,
    completed: false,
    slides: [
      {
        title: "What is an Angle?",
        content: "An angle is formed by two rays that share a common endpoint called the vertex.",
        diagram: "angle-definition",
        bullets: [
          "Rays: The sides of the angle.",
          "Vertex: The common endpoint.",
          "Naming: Use three letters (∠ABC) or just the vertex (∠B)."
        ]
      }
    ],
    quiz: [
      {
        id: 2,
        text: "An angle is a geometric figure that consists of:",
        options: ["Two intersecting lines", "A number between 0 and 360", "Two rays with a common endpoint", "Two distinct points and all the points between them"],
        correctAnswer: 2,
        explanation: "By definition, an angle is the union of two rays with a common endpoint."
      }
    ]
  },
  {
    id: 3,
    title: "Level 3: Segment Secrets",
    description: "Understanding midpoints and the Segment Addition Postulate.",
    xpValue: 200,
    unlocked: false,
    completed: false,
    slides: [
      {
        title: "Midpoints & Bisectors",
        content: "A midpoint divides a segment into two congruent (equal) parts.",
        diagram: "midpoint-visualization",
        bullets: [
          "If M is the midpoint of AB, then AM = MB.",
          "Segment Addition: If B is between A and C, then AB + BC = AC."
        ]
      }
    ],
    quiz: [
      {
        id: 3,
        text: "If T is the midpoint of RS and V lies between R and T, which statement must be true?",
        options: ["RV + VT = TS", "ST + TV = RT", "RV ≅ TV", "VS ≅ ST"],
        correctAnswer: 0,
        explanation: "Since T is the midpoint, RT = TS. Since V is between R and T, RV + VT = RT. Therefore, RV + VT = TS."
      }
    ]
  },
  {
    id: 4,
    title: "Level 4: Parallel & Perpendicular",
    description: "Mastering the relationship between lines on a plane.",
    xpValue: 200,
    unlocked: false,
    completed: false,
    slides: [
      {
        title: "Parallel vs. Perpendicular",
        content: "The behavior of lines determines their classification.",
        diagram: "parallel-perpendicular",
        bullets: [
          "Parallel: Lines in the same plane that never intersect.",
          "Perpendicular: Lines that intersect to form 90° angles.",
          "Slopes: Parallel lines have equal slopes."
        ]
      }
    ],
    quiz: [
      {
        id: 4,
        text: "Which statement describes two parallel lines?",
        options: ["They do not intersect and they lie on the same plane", "They do not intersect and they do not lie on the same plane", "They intersect at a point and form right angles", "They intersect at a point but do not form right angles"],
        correctAnswer: 0,
        explanation: "Parallel lines are coplanar (same plane) and never intersect."
      }
    ]
  },
  {
    id: 5,
    title: "Level 5: The Midpoint Formula",
    description: "Calculating positions in the coordinate plane.",
    xpValue: 250,
    unlocked: false,
    completed: false,
    slides: [
      {
        title: "Midpoint Formula",
        content: "To find the middle of two points (x₁, y₁) and (x₂, y₂):",
        diagram: "coordinate-midpoint",
        bullets: [
          "x-coordinate: (x₁ + x₂) / 2",
          "y-coordinate: (y₁ + y₂) / 2",
          "It's just the average of the coordinates!"
        ]
      }
    ],
    quiz: [
      {
        id: 5,
        text: "What is the midpoint of the segment joining (2, 6) and (10, 12)?",
        options: ["(5, 6)", "(1, 3)", "(6, 9)", "(12, 18)"],
        correctAnswer: 2,
        explanation: "((2+10)/2, (6+12)/2) = (12/2, 18/2) = (6, 9)."
      }
    ]
  },
  {
    id: 6,
    title: "Level 6: Final Unit Assessment",
    description: "Synthesize all concepts to earn your Unit 7 Certification.",
    xpValue: 500,
    unlocked: false,
    completed: false,
    slides: [
      {
        title: "The Ultimate Test",
        content: "This assessment covers everything from undefined terms to coordinate geometry. Read each question carefully as it may combine multiple concepts.",
        diagram: "geometry-mashup",
        bullets: [
          "Review your definitions of points, lines, and planes.",
          "Remember the midpoint formula for coordinates.",
          "Parallel lines have equal slopes; perpendicular slopes are opposite reciprocals."
        ]
      }
    ],
    quiz: [
      {
        id: 61,
        text: "Point B is between A and C on a line. If AB = x + 3, BC = 2x - 1, and AC = 11, find the value of x.",
        options: ["x = 3", "x = 4", "x = 5", "x = 9"],
        correctAnswer: 0,
        explanation: "AB + BC = AC. (x + 3) + (2x - 1) = 11. 3x + 2 = 11. 3x = 9. x = 3."
      },
      {
        id: 62,
        text: "Which of the following describes a set of points that are on the same line?",
        options: ["Coplanar", "Collinear", "Bisectors", "Congruent"],
        correctAnswer: 1,
        explanation: "Collinear points are points that lie on the same line."
      },
      {
        id: 63,
        text: "If line 'm' has a slope of -3/4, what is the slope of any line perpendicular to 'm'?",
        options: ["-3/4", "3/4", "-4/3", "4/3"],
        correctAnswer: 3,
        explanation: "Perpendicular lines have slopes that are negative reciprocals. The negative reciprocal of -3/4 is 4/3."
      },
      {
        id: 64,
        text: "M is the midpoint of segment PQ. If P is at (2, 4) and M is at (5, 8), find the coordinates of Q.",
        options: ["(3.5, 6)", "(8, 12)", "(7, 12)", "(1, 0)"],
        correctAnswer: 1,
        explanation: "Use the midpoint logic: to go from 2 to 5, we add 3. 5 + 3 = 8. To go from 4 to 8, we add 4. 8 + 4 = 12. So Q is (8, 12)."
      },
      {
        id: 65,
        text: "Two angles are supplementary. If one angle measures 115°, what is the measure of the other?",
        options: ["65°", "75°", "180°", "245°"],
        correctAnswer: 0,
        explanation: "Supplementary angles add up to 180°. 180 - 115 = 65."
      },
      {
        id: 66,
        text: "Which postulate states that if B is between A and C, then AB + BC = AC?",
        options: ["Angle Addition Postulate", "Segment Addition Postulate", "Midpoint Theorem", "Ruler Postulate"],
        correctAnswer: 1,
        explanation: "This is the fundamental definition of the Segment Addition Postulate."
      },
      {
        id: 67,
        text: "Three non-collinear points are required to uniquely define a:",
        options: ["Line", "Point", "Segment", "Plane"],
        correctAnswer: 3,
        explanation: "One of the fundamental properties of geometry is that a plane is defined by exactly three non-collinear points."
      },
      {
        id: 68,
        text: "If angle ∠1 and ∠2 are vertical angles, and m∠1 = 48°, what is m∠2?",
        options: ["42°", "48°", "132°", "90°"],
        correctAnswer: 1,
        explanation: "Vertical angles are always congruent (equal in measure)."
      },
      {
        id: 69,
        text: "Line k passes through (0,0) and (2,2). Line j passes through (0,1) and (2,3). These lines are:",
        options: ["Parallel", "Perpendicular", "Intersecting but not perpendicular", "The same line"],
        correctAnswer: 0,
        explanation: "Both lines have a slope of 1 ((2-0)/(2-0) and (3-1)/(2-0)). Since slopes are equal and y-intercepts are different, they are parallel."
      },
      {
        id: 70,
        text: "What is the distance between points (1, 2) and (4, 6)?",
        options: ["3", "4", "5", "7"],
        correctAnswer: 2,
        explanation: "Use the distance formula: √((4-1)² + (6-2)²) = √(3² + 4²) = √(9 + 16) = √25 = 5."
      }
    ]
  }
];
