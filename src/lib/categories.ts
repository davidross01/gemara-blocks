import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Circle,
  Sparkles,
  Scroll,
  ShieldAlert,
  Crown,
  AlertTriangle,
  Search,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

export type Category =
  | "STATEMENT"
  | "QUESTION"
  | "ANSWER"
  | "PROOF"
  | "REFUTATION"
  | "DIFFICULTY"
  | "INQUIRY"
  | "PIVOT"
  | "STORY"
  | "ASSUMPTION"
  | "CONCLUSION";

export interface CategoryMeta {
  key: Category;
  label: string;
  english: string;
  description: string;
  icon: LucideIcon;
  /** CSS token suffix matching --color-<token> in styles.css */
  token: string;
  hex: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  STATEMENT: { key: "STATEMENT", label: "Memra", english: "Statement",
    description: "A teaching or assertion made by a Sage.", icon: MessageSquare, token: "statement", hex: "#2563eb" },
  QUESTION: { key: "QUESTION", label: "Kushiya", english: "Question",
    description: "An objection asserting the standing position is problematic (kushya).", icon: AlertCircle, token: "question", hex: "#dc2626" },
  ANSWER: { key: "ANSWER", label: "Terutz", english: "Answer",
    description: "A resolution — often via okimta, tannai hi, or emendation.", icon: CheckCircle2, token: "answer", hex: "#16a34a" },
  PROOF: { key: "PROOF", label: "Raya", english: "Proof",
    description: "Evidence supporting a position.", icon: BookOpen, token: "proof", hex: "#7c3aed" },
  REFUTATION: { key: "REFUTATION", label: "Teyuvta", english: "Refutation",
    description: "Decisive, fatal refutation — the position is removed from the board.", icon: ShieldAlert, token: "refutation", hex: "#ea580c" },
  DIFFICULTY: { key: "DIFFICULTY", label: "Kashya", english: "Difficulty",
    description: "A difficulty left standing but not fatal — position weakened, not overturned.", icon: AlertTriangle, token: "difficulty", hex: "#b45309" },
  INQUIRY: { key: "INQUIRY", label: "Ba'aya", english: "Open Inquiry",
    description: "A genuine dilemma raised for investigation (not an objection). May end in teiku.", icon: Search, token: "inquiry", hex: "#0d9488" },
  PIVOT: { key: "PIVOT", label: "Ela", english: "Pivot",
    description: "The אלא move — discards the prior line and substitutes a new one.", icon: GitBranch, token: "pivot", hex: "#be185d" },
  STORY: { key: "STORY", label: "Ma'aseh", english: "Story",
    description: "A narrative or historical account.", icon: Scroll, token: "story", hex: "#a855f7" },
  ASSUMPTION: { key: "ASSUMPTION", label: "Hava Amina", english: "Assumption",
    description: "A provisional 'I would have thought' thesis, staged to be overturned.", icon: HelpCircle, token: "assumption", hex: "#6b7280" },
  CONCLUSION: { key: "CONCLUSION", label: "Maskana", english: "Conclusion",
    description: "The Gemara's settled conclusion (or a chiddush: קא משמע לן).", icon: Crown, token: "conclusion", hex: "#ca8a04" },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);

// re-export to silence unused import
export const _unused = { Sparkles, Circle };