import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import demoEml from "@/data/demo-attack.eml.txt?raw";
import { parseEmlBuffer } from "./email-parser";
import { analyzeThreat } from "./threat-engine";
import { correlateCampaign } from "./campaign-engine";
import { analyzeEmailWithAi } from "./ai";

async function runAnalysis(rawEml: string) {
  const email = await parseEmlBuffer(rawEml);
  const threat = analyzeThreat(email);
  const campaign = correlateCampaign(email, threat);
  const ai = await analyzeEmailWithAi(email, threat, campaign);
  return { email, threat, campaign, ai };
}

export const analyzeEml = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ rawEml: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    return { success: true as const, ...(await runAnalysis(data.rawEml)) };
  });

export const analyzeDemoAttack = createServerFn({ method: "POST" }).handler(async () => {
  return {
    success: true as const,
    filename: "demo-attack.eml",
    rawEml: demoEml,
    ...(await runAnalysis(demoEml)),
  };
});
