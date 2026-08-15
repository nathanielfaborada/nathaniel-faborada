export const GITHUB_GROUPS = [
  {
    label: "College Thesis Capstone",
    users: ["raecellann", "Wesmabe1129", "zjdelossantos"],
  },
  {
    label: "Threads Clone",
    users: ["johnpaul-bodino", "DietherPano", "Genniesysbracia", "Nahiwagaan"],
  },
  {
    label: "Internship",
    users: [
      "JabbyAlicante",
      "beatricecoleene",
      "sudonotrey",
      "Haimonmon",
      "lykhasalustiano",
      "DietherPano",
    ],
  },
];

export const GITHUB_USERS = [...new Set(GITHUB_GROUPS.flatMap((g) => g.users))];

export const GITHUB_ORGANIZATIONS = [
  "college-of-mary-immaculate",
  "Jenather-Auto-Shop",
  "Immaculearn",
  "Treads-Clone",
];
