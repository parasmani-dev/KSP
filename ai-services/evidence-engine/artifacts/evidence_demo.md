# KSP IntelligenceOS - Evidence Engine Demonstration

This artifact demonstrates the capabilities of the 5 AI Endpoints we built natively with Google Gemini. 

## Case Context: Jewellery Shop Heist

**FIR (Complainant: Rajesh Gowda):**
> On 14th Nov 2024 at around 22:30 hours, complainant Mr. Rajesh Gowda (Ph: 9945123456) reported that his jewelry shop 'Lakshmi Jewellers' in Electronic City Phase 1, Bengaluru, was broken into. Two suspects wearing masks entered by breaking the back shutter. They stole 2kg of gold ornaments worth Rs 1.5 Crores. Suspects escaped in a white Toyota Innova bearing registration KA-51-MD-9088 heading towards Silk Board.

**Witness Statement (Neighbor Suresh):**
> I am Suresh, owner of the adjacent shop. On the night of 14th Nov, I was closing my shop at 10:45 PM. I heard a loud noise from Lakshmi Jewellers. I saw three men running out carrying heavy black bags. They jumped into a black Mahindra Scorpio and sped towards Hosur Road.

---

## 1. Automated Summarization (`POST /api/v1/summarization/`)
- **Crime Type:** `Burglary/Robbery`
- **Location:** `Lakshmi Jewellers, Electronic City Phase 1, Bengaluru`
- **Victim:** `Mr. Rajesh Gowda, owner of Lakshmi Jewellers`
- **Suspects:** `Two suspects wearing masks, escaped in a white Toyota Innova (KA-51-MD-9088)`
- **Summary:** On November 14, 2024, at approximately 22:30 hours, Lakshmi Jewellers was broken into by two masked suspects. They stole 2kg of gold ornaments valued at Rs 1.5 Crores. The suspects fled in a white Toyota Innova.

## 2. Extracted Entities (`POST /api/v1/extraction/`)
*Ready to be inserted into the Knowledge Graph for Module 2.*

| Entity | Type | Confidence |
|--------|------|------------|
| Mr. Rajesh Gowda | persons | N/A |
| Two suspects | persons | N/A |
| Electronic City Phase 1 | locations | N/A |
| Bengaluru | locations | N/A |
| Silk Board | locations | N/A |
| Toyota Innova | vehicles | N/A |
| KA-51-MD-9088 | vehicles | N/A |
| 9945123456 | phone_numbers | N/A |
| 14th Nov 2024 | dates | N/A |
| 22:30 hours | times | N/A |
| Lakshmi Jewellers | organizations | N/A |

## 3. Chronological Timeline (`POST /api/v1/timeline/`)

| 🕒 Time | 📝 Event Description |
|:---|:---|

## 4. Contradiction Detection (`POST /api/v1/contradiction/`)
*Cross-referencing the FIR against the Witness Statement.*

| ⚠️ Conflict Area | 📄 Statement 1 | 📄 Statement 2 |
|:---|:---|:---|
| **Time of Incident** | On 14th Nov 2024 at around 22:30 hours | On the night of 14th Nov, I was closing my shop at 10:45 PM. I heard a loud noise from Lakshmi Jewellers. |
| **Number of Suspects** | Two suspects wearing masks entered | I saw three men running out |
| **Escape Vehicle Type** | Suspects escaped in a white Toyota Innova | They jumped into a black Mahindra Scorpio |
| **Escape Vehicle Color** | Suspects escaped in a white Toyota Innova | They jumped into a black Mahindra Scorpio |
| **Direction of Escape** | heading towards Silk Board | sped towards Hosur Road |

## 5. Evidence Scoring (`POST /api/v1/scoring/`)
- 🎯 **Overall Confidence:** `65%`
- 👤 **Entity Confidence:** `85%`
- 🤝 **Corroboration Score:** `0%`
- 📉 **Contradictions Impact:** `0%`
