// The 4 top-level branches of the content platform (see the locked
// architecture diagram). Everything else — the old "experiences",
// "projects", "learning", "technology", "competitions", "books",
// "resources", "kits", "laboratory-equipment", "laboratory-chemicals" and
// "services" groupings — now lives one level down as ExploreSubcategory
// nodes under one of these 4 branches, not as separate top-level categories.
export type ExploreCategoryId =
  | "educational"
  | "interactive"
  | "resource"
  | "commerce";

import type { ContentType } from "@/types/content";

export interface ExploreSubcategory {
  id: string;
  label: string;
  description: string;
  contentTypes?: ContentType[];
  children?: ExploreSubcategory[];
}

export interface ExploreCategory {
  id: ExploreCategoryId;
  label: string;
  description: string;
  subcategories: ExploreSubcategory[];
}

export const exploreTaxonomy: ExploreCategory[] = [
  {
    id: "educational",
    label: "Educational",
    description:
      "Structured learning content: lessons, activities, experiments, projects and technology pathways.",
    subcategories: [
      {
        id: "learning",
        label: "Learning",
        description:
          "Structured learning content for practical STEM education.",
        children: [
          {
            id: "lessons",
            label: "Lessons",
            description: "Structured lessons for guided STEM learning.",
            contentTypes: ["lesson"],
          },
          {
            id: "activities",
            label: "Activities",
            description: "Practical activities that reinforce learning through doing.",
            contentTypes: ["activity"],
          },
          {
            id: "experiments",
            label: "Experiments",
            description: "Practical investigations that develop scientific thinking.",
            contentTypes: ["experiment"],
          },
          {
            id: "worksheets",
            label: "Worksheets",
            description: "Practice and reinforcement materials for learners.",
            contentTypes: ["worksheet"],
          },
          {
            id: "assessments",
            label: "Assessments",
            description: "Learning checks, tests and practical assessments.",
            contentTypes: ["assessment"],
          },
          {
            id: "practical-science",
            label: "Practical Science",
            description: "Hands on science learning and investigation.",
          },
          {
            id: "stem-steam",
            label: "STEM & STEAM",
            description: "Integrated STEM and STEAM learning.",
          },
          {
            id: "curriculum-learning",
            label: "Curriculum Learning",
            description: "Learning aligned with curriculum pathways.",
          },
        ],
      },

      {
        id: "technology",
        label: "Technology",
        description:
          "Technology focused learning, making, coding, AI and robotics content.",
        children: [
          {
            id: "coding",
            label: "Coding",
            description: "Programming and computational thinking.",
            children: [
              {
                id: "computational-thinking",
                label: "Computational Thinking",
                description: "Problem solving through computational thinking.",
              },
              {
                id: "block-coding",
                label: "Block Coding",
                description: "Visual programming and block based coding.",
              },
              {
                id: "text-coding",
                label: "Text Based Coding",
                description: "Programming using text based languages.",
              },
              {
                id: "web-development",
                label: "Web Development",
                description: "Websites and web application development.",
              },
            ],
          },
          {
            id: "rhinox-code-studio",
            label: "Rhinox Code Studio",
            description:
              "The Rhinox environment for learning, practising and creating with code.",
            children: [
              {
                id: "coding-lessons",
                label: "Coding Lessons",
                description: "Structured coding lessons.",
                contentTypes: ["lesson"],
              },
              {
                id: "coding-projects-studio",
                label: "Coding Projects",
                description: "Practical projects created in Code Studio.",
                contentTypes: ["project"],
              },
              {
                id: "coding-challenges-studio",
                label: "Coding Challenges",
                description: "Programming challenges and problem solving.",
                contentTypes: ["challenge"],
              },
              {
                id: "coding-practice",
                label: "Practice",
                description: "Coding practice and exercises.",
              },
              {
                id: "code-showcase",
                label: "Code Showcase",
                description: "A place to share completed coding work.",
              },
            ],
          },
          {
            id: "robotics",
            label: "Robotics",
            description: "Robotics, automation and physical computing.",
            children: [
              {
                id: "robotics-fundamentals",
                label: "Robotics Fundamentals",
                description: "Foundations of robotics.",
              },
              {
                id: "electronics",
                label: "Electronics",
                description: "Electronic systems and components.",
              },
              {
                id: "sensors",
                label: "Sensors",
                description: "Sensors, measurement and data collection.",
              },
              {
                id: "automation",
                label: "Automation",
                description: "Automated systems and control.",
              },
              {
                id: "robotics-projects-technology",
                label: "Robotics Projects",
                description: "Robotics build and programming projects.",
                contentTypes: ["project"],
              },
            ],
          },
          {
            id: "ai-robotics",
            label: "AI & Robotics",
            description:
              "Artificial intelligence and intelligent robotics learning.",
            children: [
              {
                id: "ai-foundations",
                label: "AI Foundations",
                description: "Foundations of artificial intelligence.",
              },
              {
                id: "machine-learning",
                label: "Machine Learning",
                description: "Age appropriate introduction to machine learning.",
              },
              {
                id: "ai-projects",
                label: "AI Projects",
                description: "Practical projects involving AI.",
                contentTypes: ["project"],
              },
              {
                id: "intelligent-robotics",
                label: "Intelligent Robotics",
                description: "Robotics combined with intelligent systems.",
              },
              {
                id: "human-machine-interaction",
                label: "Human & Machine Interaction",
                description: "Exploring interaction between people and intelligent systems.",
              },
            ],
          },
          {
            id: "digital-making",
            label: "Digital Making",
            description:
              "Creative technology, physical computing and prototyping.",
            children: [
              {
                id: "digital-electronics",
                label: "Electronics",
                description: "Hands on electronics and circuit making.",
              },
              {
                id: "physical-computing",
                label: "Physical Computing",
                description: "Computing connected to physical systems.",
              },
              {
                id: "digital-fabrication",
                label: "Digital Fabrication",
                description: "Digital tools for creating physical objects.",
              },
              {
                id: "prototyping",
                label: "Prototyping",
                description: "Rapid prototyping and product creation.",
              },
            ],
          },
          {
            id: "engineering-technology",
            label: "Engineering Technology",
            description:
              "Technology applications in engineering and technical problem solving.",
          },
        ],
      },

      {
        id: "projects",
        label: "Projects",
        description:
          "Practical projects that help learners move from ideas to building and creating.",
        children: [
          {
            id: "science-projects",
            label: "Science Projects",
            description: "Projects for investigating scientific ideas and phenomena.",
            contentTypes: ["project"],
            children: [
              {
                id: "physics-projects",
                label: "Physics",
                description: "Practical physics projects.",
                contentTypes: ["project"],
              },
              {
                id: "chemistry-projects",
                label: "Chemistry",
                description: "Practical chemistry projects.",
                contentTypes: ["project"],
              },
              {
                id: "biology-projects",
                label: "Biology",
                description: "Practical biology projects.",
                contentTypes: ["project"],
              },
              {
                id: "environmental-projects",
                label: "Environmental Science",
                description: "Projects focused on environmental science.",
                contentTypes: ["project"],
              },
            ],
          },
          {
            id: "engineering-projects",
            label: "Engineering Projects",
            description: "Design and build projects based on engineering thinking.",
            contentTypes: ["project"],
            children: [
              {
                id: "structures",
                label: "Structures",
                description: "Structural design and construction projects.",
                contentTypes: ["project"],
              },
              {
                id: "mechanical-systems",
                label: "Mechanical Systems",
                description: "Mechanical design and systems projects.",
                contentTypes: ["project"],
              },
              {
                id: "electrical-systems",
                label: "Electrical Systems",
                description: "Electrical and electronic engineering projects.",
                contentTypes: ["project"],
              },
              {
                id: "design-build",
                label: "Design & Build",
                description: "Open ended engineering design projects.",
                contentTypes: ["project"],
              },
            ],
          },
          {
            id: "coding-projects",
            label: "Coding Projects",
            description: "Projects that introduce programming through practical creation.",
            contentTypes: ["project"],
            children: [
              {
                id: "scratch-projects",
                label: "Scratch",
                description: "Creative block coding projects.",
                contentTypes: ["project"],
              },
              {
                id: "programming-projects",
                label: "Programming",
                description: "Text based programming projects.",
                contentTypes: ["project"],
              },
              {
                id: "web-development-projects",
                label: "Web Development",
                description: "Projects involving websites and web applications.",
                contentTypes: ["project"],
              },
              {
                id: "computational-thinking-projects",
                label: "Computational Thinking",
                description: "Projects developing computational problem solving.",
                contentTypes: ["project"],
              },
            ],
          },
          {
            id: "robotics-projects",
            label: "Robotics Projects",
            description: "Build and programming projects involving robotics and automation.",
            contentTypes: ["project"],
            children: [
              {
                id: "beginner-robotics",
                label: "Beginner Robotics",
                description: "Entry level robotics projects.",
                contentTypes: ["project"],
              },
              {
                id: "robotics-sensors",
                label: "Sensors",
                description: "Projects involving sensors and data.",
                contentTypes: ["project"],
              },
              {
                id: "automation-projects",
                label: "Automation",
                description: "Projects involving automated systems.",
                contentTypes: ["project"],
              },
              {
                id: "autonomous-systems",
                label: "Autonomous Systems",
                description: "Projects involving autonomous behaviour.",
                contentTypes: ["project"],
              },
            ],
          },
          {
            id: "steam-projects",
            label: "STEAM Projects",
            description:
              "Integrated projects combining science, technology, engineering, arts and mathematics.",
            contentTypes: ["project"],
            children: [
              {
                id: "art-technology",
                label: "Art & Technology",
                description: "Projects combining creative arts and technology.",
                contentTypes: ["project"],
              },
              {
                id: "design-projects",
                label: "Design",
                description: "Creative design and problem solving projects.",
                contentTypes: ["project"],
              },
              {
                id: "making-projects",
                label: "Making",
                description: "Hands on making and prototyping projects.",
                contentTypes: ["project"],
              },
              {
                id: "cross-disciplinary-projects",
                label: "Cross disciplinary Projects",
                description: "Projects combining multiple STEM disciplines.",
                contentTypes: ["project"],
              },
            ],
          },
        ],
      },

    ],
  },

  {
    id: "interactive",
    label: "Interactive",
    description:
      "Runtime-driven learning: experiences, virtual labs, games, quizzes and competitions.",
    subcategories: [
      {
        id: "experiences",
        label: "Experiences",
        description:
          "Interactive experiences that turn learning into exploration, practice and discovery.",
        children: [
          {
            id: "games",
            label: "Games",
            description:
              "Interactive games that make STEM learning engaging and practical.",
            contentTypes: ["game"],
            children: [
              {
                id: "science-games",
                label: "Science Games",
                description: "Games for exploring scientific concepts.",
                contentTypes: ["game"],
              },
              {
                id: "mathematics-games",
                label: "Mathematics Games",
                description: "Games that develop mathematical thinking.",
                contentTypes: ["game"],
              },
              {
                id: "coding-games",
                label: "Coding Games",
                description: "Games that introduce programming and computational thinking.",
                contentTypes: ["game"],
              },
              {
                id: "engineering-games",
                label: "Engineering Games",
                description: "Games based on design, systems and engineering thinking.",
                contentTypes: ["game"],
              },
              {
                id: "robotics-games",
                label: "Robotics Games",
                description: "Games involving robotics, automation and control.",
                contentTypes: ["game"],
              },
            ],
          },
          {
            id: "stem-quizzes",
            label: "STEM Quizzes",
            description:
              "Interactive quizzes for practice, revision and knowledge checks.",
            contentTypes: ["quiz"],
            children: [
              {
                id: "science-quizzes",
                label: "Science",
                description: "Science knowledge checks and quizzes.",
                contentTypes: ["quiz"],
              },
              {
                id: "mathematics-quizzes",
                label: "Mathematics",
                description: "Mathematics quizzes and practice.",
                contentTypes: ["quiz"],
              },
              {
                id: "technology-quizzes",
                label: "Technology",
                description: "Technology and computing quizzes.",
                contentTypes: ["quiz"],
              },
              {
                id: "general-stem-quizzes",
                label: "General STEM",
                description: "Cross disciplinary STEM quizzes.",
                contentTypes: ["quiz"],
              },
            ],
          },
          {
            id: "interactive-learning",
            label: "Interactive Learning",
            description:
              "Interactive activities that combine learning, exploration and practice.",
            children: [
              {
                id: "explorations",
                label: "Explorations",
                description: "Guided interactive explorations.",
              },
              {
                id: "demonstrations",
                label: "Demonstrations",
                description: "Interactive demonstrations of STEM concepts.",
              },
              {
                id: "interactive-lessons",
                label: "Interactive Lessons",
                description: "Lessons enhanced with interactive elements.",
              },
            ],
          },
        ],
      },

        {
          id: "virtual-labs",
          label: "Virtual Labs",
          description:
            "Advanced virtual practicals that let learners run experiments, record results and test their understanding.",
          contentTypes: ["experiment"],
          children: [
            {
              id: "physics",
              label: "Physics",
              description: "Virtual investigations into physical phenomena.",
              contentTypes: ["experiment"],
            },
            {
              id: "chemistry",
              label: "Chemistry",
              description: "Virtual chemistry investigations and demonstrations.",
              contentTypes: ["experiment"],
            },
            {
              id: "biology",
              label: "Biology",
              description: "Virtual investigations into living systems.",
              contentTypes: ["experiment"],
            },
            {
              id: "environmental-science",
              label: "Environmental Science",
              description: "Virtual investigations of environmental systems.",
              contentTypes: ["experiment"],
            },
            {
              id: "earth-space",
              label: "Earth & Space",
              description: "Virtual exploration of Earth and space science.",
              contentTypes: ["experiment"],
            },
            {
              id: "engineering",
              label: "Engineering",
              description: "Virtual labs on machines, structures and energy.",
              contentTypes: ["experiment"],
            },
          ],
        },
      {
        id: "competitions",
        label: "Competitions",
        description:
          "Challenges and competitive experiences that encourage learners to apply what they know.",
        children: [
          {
            id: "science-challenges",
            label: "Science Challenges",
            description: "Science based challenges and investigations.",
            contentTypes: ["challenge"],
          },
          {
            id: "engineering-challenges",
            label: "Engineering Challenges",
            description: "Design and build engineering challenges.",
            contentTypes: ["challenge"],
          },
          {
            id: "coding-challenges",
            label: "Coding Challenges",
            description: "Programming and computational challenges.",
            contentTypes: ["challenge"],
          },
          {
            id: "robotics-challenges",
            label: "Robotics Challenges",
            description: "Robotics design and programming challenges.",
            contentTypes: ["challenge"],
          },
          {
            id: "steam-challenges",
            label: "STEAM Challenges",
            description: "Integrated STEAM challenges.",
            contentTypes: ["challenge"],
          },
          {
            id: "school-competitions",
            label: "School Competitions",
            description: "Competitions designed for schools and learning institutions.",
            contentTypes: ["challenge"],
          },
          {
            id: "stem-competitions",
            label: "STEM Competitions",
            description: "Broader STEM competitions and programmes.",
            contentTypes: ["challenge"],
          },
          {
            id: "rhinox-stem-club",
            label: "Rhinox STEM Club",
            description:
              "The Rhinox community and programme environment for STEM participation.",
          },
        ],
      },

    ],
  },

  {
    id: "resource",
    label: "Resource",
    description:
      "Reference and support materials for learners, teachers, parents and schools.",
    subcategories: [
      {
        id: "resources",
        label: "Resources",
        description:
          "Useful learning materials for learners, teachers and parents.",
        children: [
          {
            id: "articles",
            label: "Articles",
            description: "Educational articles and STEM insights.",
            contentTypes: ["article"],
          },
          {
            id: "videos",
            label: "Videos",
            description: "Educational and companion video content.",
            contentTypes: ["video"],
            children: [
              {
                id: "science-videos",
                label: "Science",
                description: "Science videos and explanations.",
                contentTypes: ["video"],
              },
              {
                id: "technology-videos",
                label: "Technology",
                description: "Technology and computing videos.",
                contentTypes: ["video"],
              },
              {
                id: "engineering-videos",
                label: "Engineering",
                description: "Engineering and design videos.",
                contentTypes: ["video"],
              },
              {
                id: "coding-videos",
                label: "Coding",
                description: "Coding lessons and demonstrations.",
                contentTypes: ["video"],
              },
              {
                id: "robotics-videos",
                label: "Robotics",
                description: "Robotics videos and demonstrations.",
                contentTypes: ["video"],
              },
              {
                id: "experiment-videos",
                label: "Experiments",
                description: "Experiment demonstrations.",
                contentTypes: ["video"],
              },
              {
                id: "project-demonstrations",
                label: "Project Demonstrations",
                description: "Practical project demonstrations.",
                contentTypes: ["video"],
              },
              {
                id: "tutorials",
                label: "Tutorials",
                description: "Step by step tutorials.",
                contentTypes: ["video"],
              },
              {
                id: "stem-stories",
                label: "STEM Stories",
                description: "Stories that inspire STEM learning and creativity.",
                contentTypes: ["video"],
              },
            ],
          },
          {
            id: "free-downloads",
            label: "Free Downloads",
            description: "Downloadable learning and teaching materials.",
            contentTypes: ["download", "worksheet"],
          },
          {
            id: "teacher-resources",
            label: "Teacher Resources",
            description: "Resources designed to support teachers.",
            contentTypes: ["teacher-resource"],
          },
          {
            id: "parent-resources",
            label: "Parent Resources",
            description: "Resources that help parents support learning.",
            contentTypes: ["parent-resource"],
          },
          {
            id: "lesson-resources",
            label: "Lesson Resources",
            description: "Supporting materials for lessons and teaching.",
          },
          {
            id: "reference-materials",
            label: "Reference Materials",
            description: "Reference content for learning and teaching.",
          },
        ],
      },

      {
        id: "services",
        label: "Services",
        description:
          "Professional scientific, educational, laboratory and technical services.",
        children: [
          {
            id: "laboratory-design",
            label: "Laboratory Design",
            description: "Laboratory planning and design services.",
          },
          {
            id: "laboratory-construction",
            label: "Laboratory Construction",
            description: "Laboratory construction and development services.",
          },
          {
            id: "laboratory-installation",
            label: "Laboratory Installation",
            description: "Laboratory equipment installation and setup.",
          },
          {
            id: "laboratory-equipment-supply",
            label: "Laboratory Equipment Supply",
            description: "Supply and sourcing of laboratory equipment.",
          },
          {
            id: "scientific-procurement",
            label: "Scientific Procurement",
            description: "Scientific equipment, materials and procurement support.",
          },
          {
            id: "school-stem-solutions",
            label: "School STEM Solutions",
            description: "STEM solutions designed for schools and institutions.",
          },
          {
            id: "teacher-training",
            label: "Teacher Training",
            description: "Professional development and STEM teacher training.",
            contentTypes: ["teacher-resource"],
          },
          {
            id: "coding-robotics-training",
            label: "Coding & Robotics Training",
            description: "Coding, robotics and technology training programmes.",
          },
          {
            id: "stem-workshops",
            label: "STEM Workshops",
            description: "Practical STEM workshops and hands on training.",
          },
          {
            id: "technical-support",
            label: "Technical Support",
            description: "Technical assistance for scientific and STEM solutions.",
          },
        ],
      },

    ],
  },

  {
    id: "commerce",
    label: "Commerce",
    description:
      "Everything purchasable from Rhinox Scientifica: books, kits, equipment and chemicals.",
    subcategories: [
      {
        id: "books",
        label: "Books",
        description:
          "Books and structured learning publications designed to support practical learning.",
        children: [
          {
            id: "think-move-code",
            label: "Think, Move, Code!",
            description: "The Rhinox Think, Move, Code! learning series.",
            contentTypes: ["product"],
          },
          {
            id: "science-books",
            label: "Science Books",
            description: "Books focused on scientific knowledge and discovery.",
            contentTypes: ["product"],
          },
          {
            id: "workbooks",
            label: "Workbooks",
            description: "Structured practice books for learners.",
            contentTypes: ["product"],
          },
          {
            id: "activity-books",
            label: "Activity Books",
            description: "Books combining learning with practical activities.",
            contentTypes: ["product"],
          },
          {
            id: "project-books",
            label: "Project Books",
            description: "Books focused on practical projects and making.",
            contentTypes: ["product"],
          },
          {
            id: "teacher-guides",
            label: "Teacher Guides",
            description: "Books and guides designed to support educators.",
            contentTypes: ["product", "teacher-resource"],
          },
        ],
      },

      {
        id: "kits",
        label: "Kits",
        description:
          "STEM and STEAM kits for practical learning, building and experimentation.",
        children: [
          {
            id: "stem-kits",
            label: "STEM Kits",
            description: "Practical STEM learning kits.",
            contentTypes: ["product"],
          },
          {
            id: "science-kits",
            label: "Science Kits",
            description: "Hands on science learning and experiment kits.",
            contentTypes: ["product"],
          },
          {
            id: "engineering-kits",
            label: "Engineering Kits",
            description: "Engineering design and construction kits.",
            contentTypes: ["product"],
          },
          {
            id: "coding-kits",
            label: "Coding Kits",
            description: "Kits supporting programming and computational learning.",
            contentTypes: ["product"],
          },
          {
            id: "robotics-kits",
            label: "Robotics Kits",
            description: "Robotics, automation and programming kits.",
            contentTypes: ["product"],
          },
          {
            id: "electronics-kits",
            label: "Electronics Kits",
            description: "Hands on electronics and circuit kits.",
            contentTypes: ["product"],
          },
          {
            id: "steam-kits",
            label: "STEAM Kits",
            description: "Integrated STEAM learning kits.",
            contentTypes: ["product"],
          },
        ],
      },

      {
        id: "laboratory-equipment",
        label: "Laboratory Equipment",
        description:
          "Scientific equipment, instruments, accessories and laboratory supplies.",
        children: [
          {
            id: "general-laboratory-equipment",
            label: "General Laboratory Equipment",
            description: "Essential equipment and accessories for laboratories.",
            contentTypes: ["product"],
            children: [
              {
                id: "laboratory-glassware",
                label: "Laboratory Glassware",
                description: "Glassware used in laboratory work.",
                contentTypes: ["product"],
              },
              {
                id: "laboratory-plasticware",
                label: "Plasticware",
                description: "Laboratory plasticware and accessories.",
                contentTypes: ["product"],
              },
              {
                id: "laboratory-furniture",
                label: "Laboratory Furniture",
                description: "Furniture and workstations for laboratories.",
                contentTypes: ["product"],
              },
              {
                id: "general-lab-accessories",
                label: "General Lab Accessories",
                description: "General laboratory accessories and supplies.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "measuring-analytical",
            label: "Measuring & Analytical Equipment",
            description: "Instruments for measurement and analysis.",
            contentTypes: ["product"],
            children: [
              {
                id: "balances",
                label: "Balances",
                description: "Laboratory weighing and balance equipment.",
                contentTypes: ["product"],
              },
              {
                id: "ph-meters",
                label: "pH Meters",
                description: "Equipment for pH measurement.",
                contentTypes: ["product"],
              },
              {
                id: "thermometers",
                label: "Thermometers",
                description: "Laboratory temperature measurement.",
                contentTypes: ["product"],
              },
              {
                id: "conductivity-meters",
                label: "Conductivity Meters",
                description: "Electrical conductivity measurement equipment.",
                contentTypes: ["product"],
              },
              {
                id: "measuring-instruments",
                label: "Measuring Instruments",
                description: "General scientific measurement instruments.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "microscopy",
            label: "Microscopy",
            description: "Microscopes, accessories and microscopy supplies.",
            contentTypes: ["product"],
            children: [
              {
                id: "microscopes",
                label: "Microscopes",
                description: "Laboratory and educational microscopes.",
                contentTypes: ["product"],
              },
              {
                id: "stereo-microscopes",
                label: "Stereo Microscopes",
                description: "Stereo and dissecting microscopes.",
                contentTypes: ["product"],
              },
              {
                id: "microscope-accessories",
                label: "Microscope Accessories",
                description: "Accessories for microscopy.",
                contentTypes: ["product"],
              },
              {
                id: "slides-consumables",
                label: "Slides & Consumables",
                description: "Microscope slides and related consumables.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "heating-mixing",
            label: "Heating & Mixing",
            description: "Laboratory equipment for heating, stirring and mixing.",
            contentTypes: ["product"],
            children: [
              {
                id: "hot-plates",
                label: "Hot Plates",
                description: "Laboratory heating plates.",
                contentTypes: ["product"],
              },
              {
                id: "magnetic-stirrers",
                label: "Magnetic Stirrers",
                description: "Laboratory stirring equipment.",
                contentTypes: ["product"],
              },
              {
                id: "heating-mantles",
                label: "Heating Mantles",
                description: "Controlled laboratory heating equipment.",
                contentTypes: ["product"],
              },
              {
                id: "mixers",
                label: "Mixers",
                description: "Laboratory mixing equipment.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "separation-preparation",
            label: "Separation & Preparation",
            description: "Equipment for sample separation and preparation.",
            contentTypes: ["product"],
            children: [
              {
                id: "centrifuges",
                label: "Centrifuges",
                description: "Laboratory centrifugation equipment.",
                contentTypes: ["product"],
              },
              {
                id: "filtration",
                label: "Filtration",
                description: "Laboratory filtration equipment.",
                contentTypes: ["product"],
              },
              {
                id: "distillation",
                label: "Distillation",
                description: "Laboratory distillation equipment.",
                contentTypes: ["product"],
              },
              {
                id: "sample-preparation",
                label: "Sample Preparation",
                description: "Equipment for laboratory sample preparation.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "biology-life-science",
            label: "Biology & Life Science",
            description: "Equipment for biology and life science laboratories.",
            contentTypes: ["product"],
            children: [
              {
                id: "incubators",
                label: "Incubators",
                description: "Laboratory incubators.",
                contentTypes: ["product"],
              },
              {
                id: "autoclaves",
                label: "Autoclaves",
                description: "Laboratory sterilisation equipment.",
                contentTypes: ["product"],
              },
              {
                id: "water-baths",
                label: "Water Baths",
                description: "Laboratory water bath equipment.",
                contentTypes: ["product"],
              },
              {
                id: "life-science-equipment",
                label: "Life Science Equipment",
                description: "Specialised equipment for life science applications.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "physics-equipment",
            label: "Physics Equipment",
            description: "Equipment for physics teaching, experiments and laboratories.",
            contentTypes: ["product"],
            children: [
              {
                id: "mechanics-equipment",
                label: "Mechanics",
                description: "Equipment for mechanics experiments.",
                contentTypes: ["product"],
              },
              {
                id: "optics-equipment",
                label: "Optics",
                description: "Equipment for optics experiments.",
                contentTypes: ["product"],
              },
              {
                id: "electricity-magnetism",
                label: "Electricity & Magnetism",
                description: "Equipment for electricity and magnetism.",
                contentTypes: ["product"],
              },
              {
                id: "physics-measurement",
                label: "Measurement",
                description: "Physics measurement equipment.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "chemistry-equipment",
            label: "Chemistry Equipment",
            description: "Equipment for chemistry teaching and laboratories.",
            contentTypes: ["product"],
            children: [
              {
                id: "analytical-chemistry-equipment",
                label: "Analytical Equipment",
                description: "Equipment for analytical chemistry.",
                contentTypes: ["product"],
              },
              {
                id: "reaction-equipment",
                label: "Reaction Equipment",
                description: "Equipment for laboratory reactions.",
                contentTypes: ["product"],
              },
              {
                id: "chemistry-heating",
                label: "Heating Equipment",
                description: "Heating equipment used in chemistry laboratories.",
                contentTypes: ["product"],
              },
              {
                id: "chemistry-accessories",
                label: "Laboratory Accessories",
                description: "Chemistry laboratory accessories.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "safety-equipment",
            label: "Safety Equipment",
            description: "Equipment and supplies supporting laboratory safety.",
            contentTypes: ["product"],
            children: [
              {
                id: "ppe",
                label: "PPE",
                description: "Personal protective equipment.",
                contentTypes: ["product"],
              },
              {
                id: "eyewash-safety",
                label: "Eyewash & Safety",
                description: "Emergency eyewash and safety equipment.",
                contentTypes: ["product"],
              },
              {
                id: "spill-control",
                label: "Spill Control",
                description: "Equipment and materials for spill response.",
                contentTypes: ["product"],
              },
              {
                id: "laboratory-safety",
                label: "Laboratory Safety",
                description: "General laboratory safety equipment.",
                contentTypes: ["product"],
              },
            ],
          },
          {
            id: "laboratory-consumables",
            label: "Laboratory Consumables",
            description: "Consumable supplies used in laboratory work.",
            contentTypes: ["product"],
            children: [
              {
                id: "tubes",
                label: "Tubes",
                description: "Laboratory tubes and sample containers.",
                contentTypes: ["product"],
              },
              {
                id: "pipettes",
                label: "Pipettes",
                description: "Pipettes and liquid handling supplies.",
                contentTypes: ["product"],
              },
              {
                id: "gloves",
                label: "Gloves",
                description: "Laboratory gloves and protective consumables.",
                contentTypes: ["product"],
              },
              {
                id: "filters",
                label: "Filters",
                description: "Laboratory filtration consumables.",
                contentTypes: ["product"],
              },
              {
                id: "general-consumables",
                label: "General Consumables",
                description: "General laboratory consumables.",
                contentTypes: ["product"],
              },
            ],
          },
        ],
      },

      {
        id: "laboratory-chemicals",
        label: "Laboratory Chemicals",
        description:
          "Laboratory chemicals, reagents and educational science chemicals.",
        children: [
          {
            id: "acids",
            label: "Acids",
            description: "Laboratory acids and acid based reagents.",
            contentTypes: ["product"],
          },
          {
            id: "bases-alkalis",
            label: "Bases & Alkalis",
            description: "Laboratory bases and alkaline substances.",
            contentTypes: ["product"],
          },
          {
            id: "salts",
            label: "Salts",
            description: "Laboratory salts and related compounds.",
            contentTypes: ["product"],
          },
          {
            id: "solvents",
            label: "Solvents",
            description: "Laboratory solvents.",
            contentTypes: ["product"],
          },
          {
            id: "indicators",
            label: "Indicators",
            description: "Laboratory indicators and indicator solutions.",
            contentTypes: ["product"],
          },
          {
            id: "buffers",
            label: "Buffers",
            description: "Buffer solutions and related laboratory products.",
            contentTypes: ["product"],
          },
          {
            id: "reagents",
            label: "Reagents",
            description: "Laboratory reagents for analysis and experimentation.",
            contentTypes: ["product"],
          },
          {
            id: "stains-dyes",
            label: "Stains & Dyes",
            description: "Laboratory stains and dyes.",
            contentTypes: ["product"],
          },
          {
            id: "biological-reagents",
            label: "Biological Reagents",
            description: "Reagents used in biological applications.",
            contentTypes: ["product"],
          },
          {
            id: "analytical-reagents",
            label: "Analytical Reagents",
            description: "Reagents used for analytical applications.",
            contentTypes: ["product"],
          },
          {
            id: "general-laboratory-chemicals",
            label: "General Laboratory Chemicals",
            description: "General purpose laboratory chemicals.",
            contentTypes: ["product"],
          },
          {
            id: "educational-science-chemicals",
            label: "Educational Science Chemicals",
            description: "Chemicals intended for educational science applications.",
            contentTypes: ["product"],
          },
        ],
      },

    ],
  },

];

export function getExploreCategory(
  categoryId: string
): ExploreCategory | null {
  return (
    exploreTaxonomy.find(
      (category) => category.id === categoryId
    ) ?? null
  );
}

export function getExploreSubcategory(
  categoryId: string,
  subcategoryId: string
): ExploreSubcategory | null {
  const category = getExploreCategory(categoryId);

  if (!category) {
    return null;
  }

  return findExploreSubcategory(
    category.subcategories,
    subcategoryId
  );
}


export function findExploreSubcategory(
  subcategories: ExploreSubcategory[],
  subcategoryId: string
): ExploreSubcategory | null {
  for (const subcategory of subcategories) {
    if (subcategory.id === subcategoryId) {
      return subcategory;
    }

    if (subcategory.children) {
      const found = findExploreSubcategory(
        subcategory.children,
        subcategoryId
      );

      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Walks a taxonomy path segment by segment (parent -> child, in order) and
 * confirms every segment actually exists at that position in the tree.
 * This is stricter than findExploreSubcategory, which would happily find a
 * subcategory id anywhere in the tree even if it belongs under a different
 * parent. A `taxonomy.path` on a content item must resolve here or the item
 * silently disappears whenever someone browses into that exact branch.
 */
export function isValidTaxonomyPath(
  categoryId: string,
  path: string[]
): boolean {
  const category = getExploreCategory(categoryId);

  if (!category) {
    return false;
  }

  let currentLevel: ExploreSubcategory[] = category.subcategories;

  for (const segment of path) {
    const match = currentLevel.find((sub) => sub.id === segment);

    if (!match) {
      return false;
    }

    currentLevel = match.children ?? [];
  }

  return true;
}

/**
 * Validates every taxonomy entry on a content item. Returns a human
 * readable error per invalid entry so a broken path is caught (in a
 * console warning during a dev/build content check) instead of the item
 * just quietly vanishing from the relevant Explore branch.
 */
export function validateContentTaxonomy(item: {
  id: string;
  taxonomy?: { category: string; path: string[] }[];
}): string[] {
  if (!item.taxonomy || item.taxonomy.length === 0) {
    return [];
  }

  const errors: string[] = [];

  for (const entry of item.taxonomy) {
    if (!isValidTaxonomyPath(entry.category, entry.path)) {
      errors.push(
        `${item.id}: taxonomy path "${entry.category}/${entry.path.join("/")}" does not match any node in exploreTaxonomy`
      );
    }
  }

  return errors;
}

