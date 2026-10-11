import {
  BookOpen01Icon,
  Database02Icon,
  SecurityLockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react-native";
import type { ContentIcon } from "./types";

/** The database stores an icon *name*; the glyphs themselves ship with the app. */
const ICONS: Record<ContentIcon, IconSvgElement> = {
  sparkles: SparklesIcon,
  book: BookOpen01Icon,
  tasks: TaskDone01Icon,
  lock: SecurityLockIcon,
  shield: ShieldCheckIcon,
  database: Database02Icon,
};

export function contentIcon(name: string | undefined): IconSvgElement {
  return (name && ICONS[name as ContentIcon]) || SparklesIcon;
}
