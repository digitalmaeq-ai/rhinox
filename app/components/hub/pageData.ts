import type { HubAction } from "./HubParts";

// Copy and pictures for every dropdown page of Shop, Resources and
// Schools & Institutions. Edit the text here; the layout lives in
// SectionPage.tsx. Product ranges below describe what Rhinox can supply;
// real catalogue items (from /content) are listed automatically where a
// section has a `catalog` entry.

export interface SectionConfig {
  title: string;
  description: string;
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
  lead: string;
  image: string;
  alt: string;
  chips: string[];
  actions: HubAction[];
  intro: {
    eyebrow: string;
    lineOne: string;
    lineTwo: string;
    text: string;
    items: { title: string; text: string }[];
  };
  // Lists real items from the content catalogue for this section path.
  catalog?: {
    path: string;
    eyebrow: string;
    lineOne: string;
    lineTwo: string;
    empty: string;
  };
  steps?: {
    eyebrow: string;
    lineOne: string;
    lineTwo: string;
    items: { title: string; text: string }[];
  };
  comingSoon?: boolean;
  closing: {
    kicker: string;
    lineOne: string;
    lineTwo: string;
    lead: string;
    actions: HubAction[];
    image: string;
  };
}

const quote: HubAction = { label: "Request a quote", href: "/schools/request-a-quote" };
const contact: HubAction = { label: "Contact Rhinox", href: "/contact" };
const contact2: HubAction = { ...contact, secondary: true };

const orderSteps = {
  eyebrow: "How to order",
  lineOne: "From a question",
  lineTwo: "to a confirmed order.",
  items: [
    { title: "Tell us", text: "Share what you need and how many." },
    { title: "We check", text: "Our team confirms what is available." },
    { title: "You approve", text: "We send a clear quotation to approve." },
    { title: "We follow up", text: "We stay in touch until it reaches you." },
  ],
};

const schoolSteps = {
  eyebrow: "How we work",
  lineOne: "From first conversation",
  lineTwo: "to a working programme.",
  items: [
    { title: "Consult", text: "We learn about your learners, space and goals." },
    { title: "Plan", text: "We shape a practical programme or plan." },
    { title: "Deliver", text: "Training, equipment and resources are put in place." },
    { title: "Support", text: "We stay close so the programme keeps working." },
  ],
};

export const pages = {
  // ------------------------------------------------------------ SHOP
  "shop-books": {
    title: "Books & Workbooks",
    description: "STEM books, workbooks, activity books and learning resources from Rhinox Scientifica, including the Think, Move, Code! series.",
    eyebrow: "Shop · Books",
    lineOne: "Books that make",
    lineTwo: "STEM practical.",
    lead: "STEM books, workbooks, activity books and learning resources, including the Think, Move, Code! series for Primary 1 to JSS3.",
    image: "/images/hero/classroom.jpg",
    alt: "Learners reading together beside a microscope",
    chips: ["Think • Move • Code!", "Workbooks", "Activity books"],
    actions: [{ label: "Request a quote", href: "/schools/request-a-quote" }, { label: "Ask about a title", href: "/contact", secondary: true }],
    intro: {
      eyebrow: "In the range",
      lineOne: "Learning that starts",
      lineTwo: "on the page.",
      text: "Our books are written to be used: explain an idea, let learners try it, then let them make something.",
      items: [
        { title: "Think • Move • Code! series", text: "A practical STEM series that builds thinking, making and coding skills across Primary and JSS levels." },
        { title: "Workbooks", text: "Practice-based workbooks for the classroom and for learning at home." },
        { title: "Activity books", text: "Hands-on activities that turn what is read into something done." },
        { title: "Companion resources", text: "Videos, downloads and interactive experiences that sit beside the books." },
      ],
    },
    catalog: { path: "/shop/books", eyebrow: "In the catalogue", lineOne: "Titles you can", lineTwo: "open right now.", empty: "More titles are being added to the catalogue." },
    steps: orderSteps,
    closing: { kicker: "Ordering for a school?", lineOne: "Tell us the titles", lineTwo: "and the quantities.", lead: "We will confirm availability and send a clear quotation.", actions: [quote, contact2], image: "/images/hero/stem-lab.jpg" },
  },
  "shop-kits": {
    title: "STEM & STEAM Kits",
    description: "Hands-on kits for experiments, projects and maker learning from Rhinox Scientifica.",
    eyebrow: "Shop · Kits",
    lineOne: "Kits for learners",
    lineTwo: "who love to make.",
    lead: "Hands-on kits for experiments, projects and maker learning, from a first STEM kit to coding and robotics builds.",
    image: "/images/journey/journey-robotics.jpg",
    alt: "Young people building a project together",
    chips: ["Experiments", "Making", "Robotics"],
    actions: [quote, contact2],
    intro: {
      eyebrow: "In the range",
      lineOne: "Learn by building,",
      lineTwo: "not just reading.",
      text: "Each kit is chosen for practical learning: clear steps, real materials and room for learners to improve on the first try.",
      items: [
        { title: "Starter STEM kits", text: "A first kit for hands-on exploration and project building." },
        { title: "Experiment kits", text: "Materials for classroom and home experiments across the sciences." },
        { title: "Maker & engineering kits", text: "Build, test and improve: structures, circuits and mechanisms." },
        { title: "Coding & robotics kits", text: "Kits that connect instructions on screen to things that move." },
      ],
    },
    catalog: { path: "/shop/kits", eyebrow: "In the catalogue", lineOne: "Kits you can", lineTwo: "explore now.", empty: "Kits are being added to the catalogue. Tell us what you are looking for." },
    steps: orderSteps,
    closing: { kicker: "Equipping a class or club?", lineOne: "Let's choose the", lineTwo: "right kits together.", lead: "Tell us the age group and how many learners and we will recommend a practical set.", actions: [quote, contact2], image: "/images/journey/journey-pexels.jpg" },
  },
  "shop-digital-resources": {
    title: "Digital Resources",
    description: "Downloadable educational resources and digital learning materials from Rhinox Scientifica.",
    eyebrow: "Shop · Digital",
    lineOne: "Learning you can",
    lineTwo: "download today.",
    lead: "Downloadable educational resources and digital learning materials for classrooms, clubs and home.",
    image: "/images/hero/coding.jpg",
    alt: "Lines of code on a screen",
    chips: ["Guides", "Worksheets", "Printables"],
    actions: [{ label: "See free downloads", href: "/resources/free-downloads" }, contact2],
    intro: {
      eyebrow: "What you will find",
      lineOne: "Ready to print,",
      lineTwo: "ready to teach.",
      text: "Digital materials make it easy to start: open, print or share, and begin the lesson.",
      items: [
        { title: "Learning guides", text: "Clear guides that explain a topic and how to teach or learn it." },
        { title: "Worksheets", text: "Practice sheets that match lessons and experiments." },
        { title: "Printable activities", text: "Activities for the classroom, club or kitchen table." },
        { title: "Companion files", text: "Extras that go with Rhinox books and experiences." },
      ],
    },
    catalog: { path: "/shop/digital-resources", eyebrow: "Available now", lineOne: "Digital resources", lineTwo: "to open.", empty: "Digital resources are being added. Check the free downloads in the meantime." },
    closing: { kicker: "Need something specific?", lineOne: "Tell us the topic", lineTwo: "and the level.", lead: "We will point you to the right resource or prepare one.", actions: [contact, { label: "Free downloads", href: "/resources/free-downloads", secondary: true }], image: "/images/hero/classroom.jpg" },
  },
  "shop-laboratory-equipment": {
    title: "Laboratory Equipment",
    description: "Scientific and laboratory equipment for schools and institutions from Rhinox Scientifica.",
    eyebrow: "Shop · Equipment",
    lineOne: "Equipment for",
    lineTwo: "real science.",
    lead: "Scientific and laboratory equipment for schools and institutions, supplied and supported by Rhinox.",
    image: "/images/hero/microscope.jpg",
    alt: "A compound microscope on a laboratory bench",
    chips: ["Microscopy", "Apparatus", "Measurement"],
    actions: [quote, contact2],
    intro: {
      eyebrow: "What we supply",
      lineOne: "Everything a working",
      lineTwo: "laboratory needs.",
      text: "From a single instrument to a full laboratory, we help you choose equipment that suits your learners and your curriculum.",
      items: [
        { title: "Microscopes & optics", text: "Instruments for observing the living and the very small." },
        { title: "Apparatus & glassware", text: "Everyday laboratory apparatus for chemistry and biology practicals." },
        { title: "Measurement & instruments", text: "Tools for measuring, recording and analysing." },
        { title: "Physics & electronics sets", text: "Demonstration and experiment sets for hands-on physics." },
        { title: "Safety & laboratory essentials", text: "The practical items that keep a laboratory running safely." },
      ],
    },
    catalog: { path: "/shop/laboratory-equipment", eyebrow: "In the catalogue", lineOne: "Equipment listed", lineTwo: "online.", empty: "Equipment is supplied on request. Send us your list and we will quote." },
    steps: orderSteps,
    closing: { kicker: "Setting up or upgrading?", lineOne: "Send us your", lineTwo: "equipment list.", lead: "We will confirm what is available and prepare a clear quotation.", actions: [quote, { label: "Laboratory solutions", href: "/schools/laboratory-solutions", secondary: true }], image: "/images/hero/stem-lab.jpg" },
  },
  "shop-laboratory-chemicals": {
    title: "Laboratory Chemicals",
    description: "Laboratory chemicals and related scientific supplies from Rhinox Scientifica for schools and institutions.",
    eyebrow: "Shop · Chemicals",
    lineOne: "Chemicals and supplies",
    lineTwo: "for every practical.",
    lead: "Laboratory chemicals and related scientific supplies for schools and institutions.",
    image: "/images/journey/journey-pixabay.jpg",
    alt: "Blue liquid being poured in a laboratory",
    chips: ["Reagents", "Consumables", "Supplies"],
    actions: [quote, contact2],
    intro: {
      eyebrow: "What we supply",
      lineOne: "The supplies behind",
      lineTwo: "every experiment.",
      text: "Tell us the practicals you plan to run and we will help you stock what you need, in the quantities that make sense.",
      items: [
        { title: "Common laboratory reagents", text: "Chemicals for school chemistry and biology practicals." },
        { title: "Acids, bases & indicators", text: "Core materials for reactions, testing and titration work." },
        { title: "Consumables", text: "The small items that run out first: papers, strips and similar supplies." },
        { title: "Guidance on use", text: "Our team can advise on what a practical needs before you order." },
      ],
    },
    catalog: { path: "/shop/laboratory-chemicals", eyebrow: "In the catalogue", lineOne: "Supplies listed", lineTwo: "online.", empty: "Chemicals are supplied on request. Send us your list and our team will confirm." },
    steps: orderSteps,
    closing: { kicker: "Restocking a laboratory?", lineOne: "Share your list and", lineTwo: "we will confirm.", lead: "Orders for schools and institutions are confirmed by our team before anything is sent.", actions: [quote, contact2], image: "/images/hero/microscope.jpg" },
  },

  // ------------------------------------------------------- RESOURCES
  "resources-articles": {
    title: "Articles",
    description: "STEM articles, explainers, ideas and educational insights from Rhinox Scientifica.",
    eyebrow: "Resources · Articles",
    lineOne: "Ideas worth",
    lineTwo: "reading twice.",
    lead: "STEM articles, explainers, ideas and educational insights for teachers, parents and curious learners.",
    image: "/images/journey/journey-science.jpg",
    alt: "A teacher and a young learner at a chalkboard of equations",
    chips: ["Explainers", "Ideas", "Insights"],
    actions: [{ label: "Browse articles", href: "#catalogue" }, contact2],
    intro: {
      eyebrow: "What you will find",
      lineOne: "Clear writing on",
      lineTwo: "science and learning.",
      text: "Short, practical reading that explains STEM ideas and shows how to teach and learn them well.",
      items: [
        { title: "Explainers", text: "Plain-language explanations of science, technology and maths ideas." },
        { title: "Teaching ideas", text: "Practical ways to bring a topic to life in a lesson." },
        { title: "Learning at home", text: "Support for parents who want to encourage curiosity." },
        { title: "Educational insights", text: "Why STEM learning matters and how it is changing." },
      ],
    },
    catalog: { path: "/resources/articles", eyebrow: "Latest", lineOne: "Articles to", lineTwo: "read now.", empty: "New articles are on the way." },
    closing: { kicker: "Want a topic covered?", lineOne: "Tell us what you", lineTwo: "would like to read.", lead: "Suggest a topic and we will consider it for a future article.", actions: [contact, { label: "Free downloads", href: "/resources/free-downloads", secondary: true }], image: "/images/journey/journey-unsplash.jpg" },
  },
  "resources-videos": {
    title: "Videos",
    description: "Educational videos and practical demonstrations from Rhinox Scientifica.",
    eyebrow: "Resources · Videos",
    lineOne: "Watch it done,",
    lineTwo: "then try it yourself.",
    lead: "Educational videos and practical demonstrations that support Rhinox books, lessons and experiences.",
    image: "/images/journey/journey-unsplash.jpg",
    alt: "A student looking through a microscope",
    chips: ["Demonstrations", "Companion videos", "How-tos"],
    actions: [{ label: "Watch videos", href: "#catalogue" }, { label: "Try an experience", href: "/explore/experiences", secondary: true }],
    intro: {
      eyebrow: "What you will find",
      lineOne: "Learning you can",
      lineTwo: "see in action.",
      text: "Short videos show how an experiment, build or idea works, so learners can follow along with confidence.",
      items: [
        { title: "Practical demonstrations", text: "See an experiment or build from start to finish." },
        { title: "Companion videos", text: "Videos that go with Rhinox books and lessons." },
        { title: "Classroom support", text: "Clips teachers can use to introduce or revisit a topic." },
      ],
    },
    catalog: { path: "/resources/videos", eyebrow: "Latest", lineOne: "Videos to", lineTwo: "watch now.", empty: "New videos are on the way." },
    closing: { kicker: "Learn by doing", lineOne: "Pair a video with an", lineTwo: "interactive experience.", lead: "Games, challenges and simulations let learners practise what they have just watched.", actions: [{ label: "Open the experience library", href: "/explore/experiences" }, contact2], image: "/images/hero/coding.jpg" },
  },
  "resources-free-downloads": {
    title: "Free Downloads",
    description: "Useful STEM resources available for free download from Rhinox Scientifica.",
    eyebrow: "Resources · Downloads",
    lineOne: "Free resources,",
    lineTwo: "ready to use.",
    lead: "Useful STEM resources available for free download: guides, printables and learning materials.",
    image: "/images/journey/journey-pexels.jpg",
    alt: "Students working at a laboratory bench",
    chips: ["Guides", "Printables", "Free"],
    actions: [{ label: "Browse downloads", href: "#catalogue" }, { label: "Digital resources", href: "/shop/digital-resources", secondary: true }],
    intro: {
      eyebrow: "What you will find",
      lineOne: "Open it, print it,",
      lineTwo: "use it today.",
      text: "A growing set of free materials to help teachers, parents and learners get started.",
      items: [
        { title: "Learning guides", text: "Guides that explain a topic step by step." },
        { title: "Printable activities", text: "Activities that work with a pencil, paper and curiosity." },
        { title: "Teacher aids", text: "Material to save planning time." },
      ],
    },
    catalog: { path: "/resources/free-downloads", eyebrow: "Available now", lineOne: "Downloads to", lineTwo: "open.", empty: "New downloads are on the way." },
    closing: { kicker: "Looking for more?", lineOne: "Browse the full", lineTwo: "digital resources.", lead: "Our shop also carries downloadable materials for classrooms and clubs.", actions: [{ label: "Digital resources", href: "/shop/digital-resources" }, contact2], image: "/images/hero/classroom.jpg" },
  },
  "resources-badges": {
    title: "Learning Badges",
    description: "Recognition for learning, participation and achievement with Rhinox Scientifica.",
    eyebrow: "Resources · Badges",
    lineOne: "Recognition for",
    lineTwo: "every step forward.",
    lead: "Badges recognise learning, participation and achievement as learners move through Rhinox experiences.",
    image: "/images/journey/journey-robotics.jpg",
    alt: "Young people proudly building a project together",
    chips: ["Learning", "Participation", "Achievement"],
    actions: [{ label: "Try an experience", href: "/explore/experiences" }, contact2],
    intro: {
      eyebrow: "What badges are for",
      lineOne: "Small wins that",
      lineTwo: "keep learners going.",
      text: "Badges celebrate progress. They give learners something to aim for and teachers something to point to.",
      items: [
        { title: "Learning badges", text: "For completing and understanding a topic or experience." },
        { title: "Participation badges", text: "For taking part, trying again and sticking with it." },
        { title: "Achievement badges", text: "For reaching a milestone or mastering a skill." },
      ],
    },
    catalog: { path: "/resources/badges", eyebrow: "Collection", lineOne: "Badges", lineTwo: "to earn.", empty: "Badges are being prepared and will appear here." },
    closing: { kicker: "Start earning", lineOne: "Learn by doing with an", lineTwo: "experience.", lead: "Every interactive experience is a chance to practise and grow.", actions: [{ label: "Open the experience library", href: "/explore/experiences" }, contact2], image: "/images/hero/coding.jpg" },
  },
  "resources-certificates": {
    title: "Certificates",
    description: "Certificates earned through Rhinox learning experiences.",
    eyebrow: "Resources · Certificates",
    lineOne: "Proof of what",
    lineTwo: "they have learned.",
    lead: "Certificates earned through Rhinox learning experiences, programmes and training.",
    image: "/images/hero/classroom.jpg",
    alt: "Learners studying together in a classroom",
    chips: ["Experiences", "Programmes", "Training"],
    actions: [{ label: "Try an experience", href: "/explore/experiences" }, contact2],
    intro: {
      eyebrow: "What certificates are for",
      lineOne: "A record learners",
      lineTwo: "can be proud of.",
      text: "Certificates mark a completed experience, programme or training, for learners, teachers and schools.",
      items: [
        { title: "For learners", text: "Recognition for completing experiences and programmes." },
        { title: "For teachers", text: "Evidence of professional development and training." },
        { title: "For schools", text: "A clear record of participation in Rhinox programmes." },
      ],
    },
    catalog: { path: "/resources/certificates", eyebrow: "Collection", lineOne: "Certificates", lineTwo: "to earn.", empty: "Certificates are being prepared and will appear here." },
    closing: { kicker: "Training for teachers?", lineOne: "See our teacher", lineTwo: "training programmes.", lead: "Practical professional development for STEM educators.", actions: [{ label: "Teacher training", href: "/schools/teacher-training" }, contact2], image: "/images/journey/journey-pexels.jpg" },
  },
  "resources-my-rhinox-library": {
    title: "My Rhinox Library",
    description: "A personal Rhinox learning library to collect resources, projects, achievements and progress.",
    eyebrow: "Resources · My Library",
    lineOne: "Your own place to",
    lineTwo: "keep what you learn.",
    lead: "A personal learning space where learners will collect resources, projects, achievements and progress.",
    image: "/images/hero/stem-lab.jpg",
    alt: "A bright, modern laboratory",
    chips: ["Resources", "Projects", "Progress"],
    actions: [{ label: "Browse resources", href: "/resources" }, contact2],
    comingSoon: true,
    intro: {
      eyebrow: "Coming soon",
      lineOne: "What the library",
      lineTwo: "will hold.",
      text: "Personal libraries and learner accounts will be connected in a future phase of the platform.",
      items: [
        { title: "Saved resources", text: "Collect articles, videos and downloads you want to return to." },
        { title: "Projects", text: "Keep the things you have made and worked on." },
        { title: "Achievements", text: "Badges and certificates, all in one place." },
        { title: "Progress", text: "See how far you have come." },
      ],
    },
    closing: { kicker: "In the meantime", lineOne: "Explore what is", lineTwo: "available now.", lead: "Articles, videos, downloads and interactive experiences are open to everyone.", actions: [{ label: "Browse resources", href: "/resources" }, { label: "Open experiences", href: "/explore/experiences", secondary: true }], image: "/images/journey/journey-science.jpg" },
  },

  // --------------------------------------------------------- SCHOOLS
  "schools-stem-school-solutions": {
    title: "STEM School Solutions",
    description: "Integrated STEM education solutions for schools and learning centres from Rhinox Scientifica.",
    eyebrow: "Schools · STEM solutions",
    lineOne: "One partner for your",
    lineTwo: "whole STEM programme.",
    lead: "Integrated STEM education solutions for schools and learning centres: planning, resources, training and support.",
    image: "/images/hero/classroom.jpg",
    alt: "Learners working together at a classroom table",
    chips: ["Programmes", "Resources", "Training"],
    actions: [quote, contact2],
    intro: {
      eyebrow: "What is included",
      lineOne: "Everything a school",
      lineTwo: "needs to begin.",
      text: "We bring the pieces together so STEM becomes part of everyday school life, not an extra.",
      items: [
        { title: "Programme planning", text: "A practical STEM plan shaped around your learners and timetable." },
        { title: "Books & learning resources", text: "Curriculum-aligned books and materials, including Think, Move, Code!." },
        { title: "Coding & robotics", text: "Programmes that take learners from computational thinking to building." },
        { title: "Laboratories", text: "Planning, supply and setup for practical science." },
        { title: "Teacher training", text: "Practical development so teachers feel confident to lead." },
        { title: "Ongoing support", text: "We stay close so the programme keeps working." },
      ],
    },
    steps: schoolSteps,
    closing: { kicker: "Ready to start?", lineOne: "Tell us what your", lineTwo: "school needs.", lead: "Share your requirements and we will come back with a clear, practical proposal.", actions: [quote, contact2], image: "/images/hero/stem-lab.jpg" },
  },
  "schools-laboratory-solutions": {
    title: "Laboratory Solutions",
    description: "Laboratory planning, supply, setup and support for schools and institutions from Rhinox Scientifica.",
    eyebrow: "Schools · Laboratories",
    lineOne: "Laboratories that are",
    lineTwo: "ready to teach in.",
    lead: "Laboratory planning, supply, setup and support for schools and institutions.",
    image: "/images/hero/stem-lab.jpg",
    alt: "A bright, modern school laboratory",
    chips: ["Planning", "Supply", "Setup", "Support"],
    actions: [quote, { label: "Shop equipment", href: "/shop/laboratory-equipment", secondary: true }],
    intro: {
      eyebrow: "What we do",
      lineOne: "From empty room to",
      lineTwo: "working laboratory.",
      text: "We help you think through the space, the equipment and the practicals before anything is bought.",
      items: [
        { title: "Planning", text: "Layout, equipment and practical needs shaped around your curriculum." },
        { title: "Supply", text: "Equipment, apparatus and chemicals sourced and supplied." },
        { title: "Setup", text: "Everything put in place so the laboratory is ready to use." },
        { title: "Support", text: "Help and advice after the laboratory opens." },
      ],
    },
    steps: schoolSteps,
    closing: { kicker: "Planning a laboratory?", lineOne: "Let's look at your", lineTwo: "space together.", lead: "Tell us about your school and learners and we will outline a practical plan.", actions: [quote, contact2], image: "/images/hero/microscope.jpg" },
  },
  "schools-coding-robotics": {
    title: "Coding & Robotics",
    description: "Coding and robotics programmes for schools and institutions from Rhinox Scientifica.",
    eyebrow: "Schools · Coding & robotics",
    lineOne: "Coding and robotics",
    lineTwo: "that learners love.",
    lead: "Coding and robotics programmes for schools and institutions, from first instructions to working robots.",
    image: "/images/journey/journey-robotics.jpg",
    alt: "Young people building a robotics project",
    chips: ["Computational thinking", "Coding", "Robotics"],
    actions: [quote, { label: "Explore experiences", href: "/explore/experiences", secondary: true }],
    intro: {
      eyebrow: "What we offer",
      lineOne: "A clear path from",
      lineTwo: "thinking to building.",
      text: "Programmes grow with the learner: think it through, give instructions, then build something that moves.",
      items: [
        { title: "Computational thinking", text: "Breaking problems down and planning solutions." },
        { title: "Coding", text: "Writing instructions and seeing them work." },
        { title: "Robotics", text: "Building and programming robots that do real tasks." },
        { title: "Clubs & classes", text: "Programmes that fit the timetable or after-school time." },
      ],
    },
    steps: schoolSteps,
    closing: { kicker: "Starting a club or class?", lineOne: "Tell us your learners'", lineTwo: "age and level.", lead: "We will suggest a programme and what it needs.", actions: [quote, contact2], image: "/images/hero/coding.jpg" },
  },
  "schools-teacher-training": {
    title: "Teacher Training",
    description: "Practical professional development for STEM educators from Rhinox Scientifica.",
    eyebrow: "Schools · Teacher training",
    lineOne: "Confident teachers,",
    lineTwo: "confident classrooms.",
    lead: "Practical STEM, coding, robotics and laboratory training programmes for educators.",
    image: "/images/journey/journey-pexels.jpg",
    alt: "A teacher and students working at laboratory apparatus",
    chips: ["STEM", "Coding & robotics", "Laboratory"],
    actions: [quote, contact2],
    intro: {
      eyebrow: "What teachers learn",
      lineOne: "Training teachers",
      lineTwo: "can use on Monday.",
      text: "Sessions are hands-on, so teachers leave with methods and materials they can use in class straight away.",
      items: [
        { title: "STEM teaching methods", text: "Practical ways to teach through enquiry and making." },
        { title: "Coding & robotics for teachers", text: "Build the skills to lead coding and robotics lessons." },
        { title: "Laboratory skills & safety", text: "Run practicals confidently and safely." },
        { title: "Using Rhinox resources", text: "Get the most from books, kits and experiences." },
      ],
    },
    steps: schoolSteps,
    closing: { kicker: "Training your staff?", lineOne: "Tell us how many teachers", lineTwo: "and what they teach.", lead: "We will shape a programme to match.", actions: [quote, contact2], image: "/images/hero/classroom.jpg" },
  },

  // ------------------------------------------------------- RHINOCODE
  "rhinocode-home": {
    title: "RhinoCode: Coding & Robotics",
    description: "RhinoCode is where learners program a robot, solve game challenges and build their own games.",
    eyebrow: "RhinoCode · Coding & Robotics",
    lineOne: "Learn to code by",
    lineTwo: "building and playing.",
    lead: "Program a robot with blocks, take on game challenges and build your own games. Everything runs in the browser.",
    image: "/images/hero/coding.jpg",
    alt: "A learner coding at a laptop",
    chips: ["Block coding", "Robots", "Games"],
    actions: [
      { label: "Open the Robot Lab", href: "/coding-robotics/robot-lab" },
      { label: "Game Challenges", href: "/coding-robotics/challenges", secondary: true },
    ],
    intro: {
      eyebrow: "Two studios, one platform",
      lineOne: "Pick a studio",
      lineTwo: "and start making.",
      text: "RhinoCode brings Rhinox coding learning together. Work in a studio, practise with challenges and keep what you make.",
      items: [
        { title: "RhinoBot: Robot Programming Lab", text: "Snap blocks together to guide a robot through missions, from first steps to loops and decisions." },
        { title: "RhinoCode Game Creator", text: "Design a maze, choose the rules, then play the game you built." },
        { title: "Game Challenges", text: "Short coding puzzles and missions to practise one idea at a time." },
        { title: "My Projects", text: "Your saved programmes and games, kept together and ready to reopen." },
      ],
    },
    catalog: { path: "/coding-robotics/challenges", eyebrow: "Game Challenges", lineOne: "Challenges you can", lineTwo: "play right now.", empty: "Challenges are being added. Try the Robot Lab in the meantime." },
    steps: {
      eyebrow: "How it works",
      lineOne: "Think it through,",
      lineTwo: "then make it work.",
      items: [
        { title: "Think", text: "Look at the goal and plan the steps before you start." },
        { title: "Code", text: "Build your instructions with blocks and clear steps." },
        { title: "Run", text: "Watch your code play out and see where it goes wrong." },
        { title: "Improve", text: "Fix, simplify and try again until it works well." },
      ],
    },
    closing: { kicker: "Teaching coding at school?", lineOne: "See our coding and robotics", lineTwo: "programmes for schools.", lead: "Rhinox runs coding and robotics clubs and classes for schools and institutions.", actions: [{ label: "School programmes", href: "/schools/coding-robotics" }, contact2], image: "/images/journey/journey-robotics.jpg" },
  },
} satisfies Record<string, SectionConfig>;

export type SectionKey = keyof typeof pages;
