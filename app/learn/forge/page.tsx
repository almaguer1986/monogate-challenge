import { redirect } from "next/navigation";

// /learn/forge is the historical URL; the canonical home for the
// EML-lang crash course is now /learn/eml (matches the language
// name, slots into the two-card /learn hub). External docs and
// older blog posts still point here, so we 308 (permanent) so
// search engines and link checkers update.
export default function LearnForgeRedirect() {
  redirect("/learn/eml");
}
