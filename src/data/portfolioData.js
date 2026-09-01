const portfolioData = {
  hero: {
    name: "Rahin Arefin Ahmed",
    tagline: "Focusing on Artificial Intelligence, NLP Research, and Full-Stack Web Development.",
    cv: "/assets/Rahin_Ahmed_CV.pdf",
    social: {
      linkedin: "https://www.linkedin.com/in/rahin-arefin-ahmed-164468316",
      github: "https://github.com/backlashblitz",
      twitter: "https://x.com/rahinahmed263?s=11",
      email: "mailto:rahin520@gmail.com",
    },
  },

  aboutMe: {
    title: "About Me",
    icon: "🧑‍💻",
    color: "#00e5ff",
    description:
      "Hello! I'm Rahin Arefin Ahmed, an aspiring Computer Science Student from Dhaka, Bangladesh, currently pursuing my Bachelor's degree at East West University. With a strong academic foundation and a passion for Data Science and Software Development.",
    research:
      "My primary research interests lie in the applications of AI and ML, particularly within Natural Language Processing (NLP) and building practical, scalable solutions.",
    details: [
      { label: "LOCATION", value: "Dhaka, Bangladesh", icon: "📍" },
      { label: "DEGREE", value: "B.Sc. in CSE (Pursuing)", icon: "🎓" },
      { label: "UNIVERSITY", value: "East West University", icon: "🏫" },
      { label: "FOCUS", value: "AI, NLP & Data Science", icon: "✨" },
    ],
  },

  skills: {
    title: "Technical Skills",
    icon: "⚙️",
    color: "#ffd700",
    categories: [
      {
        name: "Languages",
        icon: "</>",
        iconColor: "#00bcd4",
        items: ["Python", "C", "C++", "Java", "SQL"],
      },
      {
        name: "AI & Data Science",
        icon: "🔲",
        iconColor: "#9c27b0",
        items: ["TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Matplotlib"],
      },
      {
        name: "NLP, CV & ML",
        icon: "✨",
        iconColor: "#ffd700",
        items: ["Machine Learning", "RecSys", "NLTK", "SpaCy", "LangChain", "Transformers", "OpenCV", "YOLO"],
      },
      {
        name: "Web Development",
        icon: "🌐",
        iconColor: "#2196f3",
        items: ["JavaScript", "Next.js", "React", "Flask", "Tailwind CSS", "HTML5/CSS3", "Node.js"],
      },
      {
        name: "Tools & Databases",
        icon: "🗄️",
        iconColor: "#4caf50",
        items: ["Git", "GitHub", "MySQL", "MongoDB", "Linux", "VS Code"],
      },
    ],
  },

  projects: {
    title: "Featured Projects",
    icon: "🛠️",
    color: "#a855f7",
    items: [
      {
        name: "Bangla-Book Recommendation System",
        desc: "A machine learning-based recommendation engine tailored specifically for Bengali literature. It processes datasets to analyze user preferences and delivers personalized book suggestions.",
        tags: ["Python", "Machine Learning", "Data Science", "Pandas"],
        github: "https://github.com/backlashblitz/Bangla-Book-Recommendation-Dataset",
        image: null,
      },
      {
        name: "LenDen: Mobile Banking App",
        desc: "LenDen is a mobile banking app that enables fast, secure money transfers, deposits, and payments directly from your phone. It simplifies digital transactions, offering users a convenient way to manage finances anytime, anywhere.",
        tags: ["JavaScript", "PHP", "HTML", "CSS", "XAMPP"],
        github: "https://github.com/backlashblitz/LenDen_A-Mobile_Banking_App",
        image: null,
      },
      {
        name: "Multi-Campus Network Design",
        desc: "A full-fledged university network spanning eight campuses connected via routers. Features single DHCP/DNS architecture, OSPF dynamic routing for seamless communication, and campus-wide wireless connectivity.",
        tags: ["Cisco Packet Tracer", "Networking", "OSPF", "DHCP"],
        github: "https://github.com/backlashblitz/Design-a-full-fledged-network-for-an-organization-with-multiple-subnets.",
        image: null,
      },
      {
        name: "SMISA: Stack Machine ISA",
        desc: "A register-less, stack-based machine architecture designed to perform arithmetic operations solely using the LIFO principle. Implements a custom instruction set architecture.",
        tags: ["C", "Computer Architecture", "Systems"],
        github: "https://github.com/backlashblitz/Stack-machine-ISA-Design-a-stack-machine-its-instruction-set-must-be-stack-oriented.-No-Register-",
        image: null,
      },
    ],
  },

  publications: {
    title: "Academic Publications",
    icon: "📄",
    color: "#00bcd4",
    items: [
      {
        type: "CONFERENCE PAPER",
        title: "Towards Personalized Bangla Book Recommendation:",
        titleHighlight: "A Large-Scale Multi-Entity Book Graph Dataset",
        venue: "arXiv Preprint",
        venueHighlight: "Online",
        desc: "Introduces RokomariBG, a large-scale, multi-entity heterogeneous book graph dataset designed to support research on personalized recommendation in a low-resource language setting (Bangla). Provides a systematic benchmarking study on the Top-N recommendation task.",
        link: "https://arxiv.org/abs/2602.12129",
      },
      {
        type: "CONFERENCE PAPER",
        title: "Explainable Machine-Learning Forecasts of Building-Energy Demand from Weather Signals:",
        titleHighlight: "A Comparative Study of Classical, Ensemble and Hybrid DL Models",
        venue: "Conferenced at QPAIN 2025 (IEEE International Conference on Quantum Photonics, AI, and Networking)",
        venueHighlight: "BAUST, Saidpur, Bangladesh",
        desc: "Focuses on forecasting building energy use from weather data using machine learning and explainable AI techniques to improve prediction transparency and accuracy.",
        link: "https://www.researchgate.net/publication/395976664_Explainable_Machine-Learning_Forecasts_of_Building-Energy_Demand_from_Weather_Signals_A_Comparative_Study_of_Classical_Ensemble_and_Hybrid_DL_Models",
      },
    ],
  },

  awards: {
    title: "Awards & Certifications",
    icon: "🏆",
    color: "#ffd700",
    items: [
      {
        issuer: "GALACTIC PROBLEM SOLVER",
        title: "NASA Space Apps Challenge 2025",
        desc: "Recognized for outstanding participation and innovative efforts to address critical challenges faced on Earth and in space.",
        file: "/assets/nasa_cert.pdf",
        fileType: "pdf",
      },
      {
        issuer: "DEEPLEARNING.AI & STANFORD ONLINE",
        title: "Supervised Machine Learning: Regression and Classification",
        desc: "Completed intensive specialization on building and evaluating machine learning models, covering regression, classification, and advanced algorithms.",
        file: "/assets/cert2.pdf",
        fileType: "pdf",
      },
      {
        issuer: "IEEE PHOTONICS SOCIETY BD CHAPTER",
        title: "Certificate of Presentation (IEEE QPAIN 2025)",
        desc: "Successfully presented 'Explainable Machine-Learning Forecasts of Building-Energy Demand...' at the QPAIN 2025 international conference.",
        file: "/assets/cert3.pdf",
        fileType: "pdf",
      },
      {
        issuer: "ESHIKHON.COM",
        title: "Graphic Design Masterclass Live Course",
        desc: "Successfully completed the Graphic Design Masterclass with a score of 90%, demonstrating proficiency in design tools and principles.",
        file: "/assets/cert4.png",
        fileType: "image",
      },
    ],
  },
};

export default portfolioData;