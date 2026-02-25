# Medical Writing Protocol — UzunYaşa

_Tüm blog, araç ve sosyal medya içerikleri bu kurallara uymalıdır._

## Problem

AI-generated medical content fails in predictable ways:
1. **Generalization error** — Study used intervention X, we write "X family works" (e.g., REDUCE-IT = pure EPA → we wrote "omega-3 works")
2. **Cherry-picking** — Citing the famous positive study, ignoring negative ones on the same topic
3. **Population mismatch** — Study done in high-risk patients, we generalize to everyone
4. **Endpoint conflation** — Study measured surrogate markers (LDL, TG), we claim it reduces events (MI, death)
5. **Confidence inflation** — Preliminary data presented as established fact

---

## Rule 1: The PICO Lock

Every medical claim MUST be locked to its study's PICO:

| Element | Must specify | Common error |
|---------|-------------|--------------|
| **P** (Population) | Exact population studied | Generalizing to everyone |
| **I** (Intervention) | Exact drug/dose/formulation | Generalizing to the class |
| **C** (Comparison) | What it was compared to | Ignoring active comparator |
| **O** (Outcome) | Primary endpoint result | Citing secondary endpoints as if primary |

### Example — REDUCE-IT
- ✅ "Yüksek doz icosapent ethyl (4g/gün), statin kullanan trigliseridi ≥150 mg/dL olan hastalarda KV olayları %25 azalttı"
- ❌ "Omega-3 kalp krizini önler" (wrong I, wrong P, wrong O)

### Example — VITAL
- ✅ "25,871 sağlıklı yetişkinde omega-3 (1g/gün EPA+DHA) major KV olaylarda anlamlı azalma sağlamadı (HR 0.92, p=0.24)"
- ❌ "VITAL çalışması omega-3'ün faydasını gösterdi" (it didn't, for the primary endpoint)

---

## Rule 2: Mandatory Negative Evidence

For EVERY supplement/intervention claim, actively search for and include:
- The largest **negative** RCT on the same topic
- Any **contradictory** meta-analysis
- FDA/EMA **rejections or warnings** if applicable

Format:
```
🟢 Pozitif kanıt: [Study name, result]
🔴 Negatif kanıt: [Study name, result]  
⚖️ Net durum: [Balanced conclusion]
```

### Example — Omega-3
```
🟢 REDUCE-IT (2019): Saf EPA 4g/gün → KV olay %25↓ (ama sadece saf EPA, reçeteli ilaç)
🔴 STRENGTH (2020): EPA+DHA 4g/gün → KV olaylarda fark yok
🔴 VITAL (2018): EPA+DHA 1g/gün → Genel popülasyonda KV fayda yok
⚖️ Saf yüksek doz EPA (reçeteli): güçlü kanıt. Genel balık yağı: kanıt karışık.
```

---

## Rule 3: Tier Assignment Rules

| Tier | Criteria | Minimum evidence |
|------|----------|-----------------|
| **S** | Multiple positive Phase 3 RCTs + positive meta-analyses + guideline recommendation | ≥2 large RCTs, concordant results |
| **A** | At least 1 large positive RCT + supportive evidence | ≥1 large RCT + meta-analysis |
| **B** | Mixed results OR only surrogate endpoints OR only subgroup benefits | Conflicting RCTs or surrogate-only |
| **C** | Mostly observational, small studies, or animal data only | No large positive RCTs in humans |
| **F** | Debunked, no plausible mechanism, or evidence of harm | Negative evidence outweighs positive |

### Automatic downgrades:
- If the largest RCT is **negative** → cannot be Tier S (max Tier A)
- If results only apply to a **specific subgroup** → state subgroup, don't generalize
- If the intervention is a **class** but evidence is for one **specific molecule** → split entries
- If endpoint is only **surrogate** (lab values, not clinical events) → max Tier B for clinical claims

---

## Rule 4: The Study Citation Template

When referencing a study, always include:

```
[Study Name] ([Year], N=[sample size]):
- Population: [who was studied]
- Intervention: [exact treatment + dose]
- Primary endpoint: [what was measured]
- Result: [HR/RR/OR with CI and p-value]
- ⚠️ Limitation: [key caveat]
```

Shortened version for blog text:
```
"[Study] ([year], [N] kişi): [exact intervention] → [primary result]. [Key limitation]."
```

---

## Rule 5: Forbidden Patterns

These patterns indicate a likely error. NEVER write:

| ❌ Forbidden | ✅ Instead |
|-------------|-----------|
| "[Drug class] works because [single study]" | "[Specific drug] showed [specific result] in [specific population]" |
| "Studies show that..." (vague) | "[Study Name] (Year) showed..." |
| "Proven to prevent [disease]" | "Associated with reduced risk of [disease] in [population]" |
| "Experts recommend..." (no source) | "[Guideline body] ([year]) recommends..." |
| Citing animal studies as human evidence | "Hayvan çalışmalarında [result], ancak insan verisi henüz yetersiz 🔴" |
| "Safe and effective" without context | "Generally well-tolerated; common side effects include [list]" |
| Using subgroup results as main finding | "Alt grup analizinde [group] için fayda görüldü, ancak ana sonuç negatifti" |

---

## Rule 6: Pre-Publication Checklist

Before publishing ANY medical content:

### Scientific Accuracy (must pass all)
- [ ] Every claim has a specific study citation (not "studies show")
- [ ] PICO is correctly represented for each cited study
- [ ] Negative evidence is included for each major claim
- [ ] Tier assignment follows the rules above
- [ ] No generalization from specific molecule to entire class
- [ ] No generalization from specific population to general population
- [ ] Surrogate endpoints not presented as clinical outcomes
- [ ] Animal/in-vitro studies clearly labeled as such
- [ ] SELECT trial: mortality HR 0.81 (p=0.08, NOT significant) — never claim mortality benefit
- [ ] Turkey obesity rate: ~%32 (OECD 2024)
- [ ] Protein target: 1.2-1.6 g/kg (ESPEN 2021)

### Evidence Labels
- [ ] 🟢 Güçlü Kanıt — ≥2 concordant large RCTs
- [ ] 🟡 Orta Kanıt — 1 large RCT or mixed results
- [ ] 🔴 Ön Kanıt — observational, animal, or small studies only

### Common Traps (actively check)
- [ ] Am I conflating EPA-only evidence with general omega-3?
- [ ] Am I citing VITAL for something it didn't actually show?
- [ ] Am I presenting a reçeteli ilaç as an OTC supplement recommendation?
- [ ] Am I using relative risk reduction without absolute risk context?
- [ ] Am I confusing "statistically significant" with "clinically meaningful"?

---

## Rule 7: Self-Verification Protocol

After writing a medical claim, run this mental check:

1. **"Which exact study am I citing?"** → If you can't name it, don't claim it
2. **"What was the actual intervention?"** → Drug name, dose, formulation
3. **"Who was in the study?"** → Age, risk level, comorbidities
4. **"What was the primary endpoint?"** → Not secondary, not subgroup
5. **"Was the result statistically significant?"** → p-value, confidence interval
6. **"Is there a negative study on this?"** → Search for contradictory evidence
7. **"Am I generalizing?"** → From molecule to class? From sick to healthy? From surrogate to clinical?

If any answer is uncertain → **look it up before writing**. Do not rely on training data for specific study results.

---

## Rule 8: When In Doubt

- **Search PubMed** for the actual study before citing it
- **Check ClinicalTrials.gov** for the registered primary endpoint
- **Read the abstract** — don't rely on memory of the study
- **Flag uncertainty** in the text: "Bu konuda kanıtlar henüz kesin değil"
- **Ask Cem** if you're unsure about a clinical claim

---

## Implementation

### For auto-blog-generator.js
The system prompt should include these rules. The `validateBlogQuality()` function should check:
- Every PMID referenced is real (validate format)
- No forbidden patterns present
- Evidence labels present for key claims
- Negative evidence included

### For manual/native blog writing (me)
- Follow the self-verification protocol (Rule 7) for every medical claim
- Run the pre-publication checklist (Rule 6) before committing
- When writing about supplements, always check: "Is the evidence for this specific formulation or the class?"

### For social media (reels, carousels)
- Simplified claims still must be PICO-accurate
- If space is limited, err on the side of caution (weaker claim > wrong claim)
- Include "Kaynak: [Study]" on at least one slide

---

_Created: 2026-02-25 | Author: UzunYasaBot_
_Trigger: DHA/Omega-3 Tier assignment error — REDUCE-IT results incorrectly generalized to all omega-3 supplements_
