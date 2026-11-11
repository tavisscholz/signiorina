import { llmsTxt } from "@/lib/llms";

/** /llms.txt (see src/lib/llms.ts). No request data, so it is prerendered at build time. */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
