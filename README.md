# Ops Automation Lab — AI tools for iGaming operations

Evidence-first AI tools for iGaming B2B operators, game providers, aggregators and platform teams. Built around finance reconciliation, integration QA, incident recovery and operational evidence. The tools are also useful in other industries.

## iGaming use cases

| Operational problem | Evidence to review | Relevant tool |
| --- | --- | --- |
| A provider settlement is marked as processed | Authorized settlement reference and destination readback | Single Action Receipt Check |
| A provider integration or back-office action reports success | Expected state, actual state and duplicate effects | AI Agent Outcome & Receipt Auditor |
| A service restart is treated as incident closure | Service evidence, delivery confirmation and observation window | AI Operations Evidence & Reliability Toolkit |
| An aggregate provider invoice differs from contracted revenue share | Reviewed monthly contract, aggregate usage and invoice | Revenue Assurance Suite |

These are application examples, not claims of live casino integrations or verified customer results. No gambling functionality, access to player accounts, or payment execution is provided.

## iGaming Intelligence Lab

[Open the free workbench](https://minasyannarek13-rbb.github.io/ops-automation-skills/intelligence/) — a unified browser-based project for historical single-contract settlement review, studio operating contribution, evidence checks and casino math education. Local JSON reports, no account or data upload. The new finance modules use exact integer arithmetic; all figures require independent source review.

[Try the free browser receipt checker](https://minasyannarek13-rbb.github.io/ops-automation-skills/)

[Casino Math Lab](https://minasyannarek13-rbb.github.io/ops-automation-skills/casino-math/) — free educational RTP and blackjack payout arithmetic, not a strategy or betting tool.

## Single Action Receipt Check

A successful tool call or HTTP 202 is not proof that a business action completed. Supply redacted receipts and a known expected action. The optional local Python checker flags missing evidence, conflicting receipt IDs and duplicate destination records. It never sends messages, changes remote data, or retries an action.

Install in a compatible agent using the Skills CLI:

```sh
npx skills add minasyannarek13-RBB/ops-automation-skills --skill single-action-receipt-check
```

Or clone the repository and run the dependency-free Python 3 helper:

```sh
cd skills/single-action-receipt-check
python3 scripts/check.py < examples/accepted-only.json
```

Expected verdict: UNKNOWN. The fictional receipt only proves acceptance; reconcile the destination before retrying.

Run the included synthetic checks from the repository root:

```sh
python3 -B -m unittest discover -s tests
```

The checker trusts supplied evidence labels, not their real-world provenance. Only one expected action is supported. Independent agent-host and customer validation have not been performed. Do not provide secrets, credentials or unredacted customer records.

## Related tools by the creator

- [Free receipt check on Agensi](https://www.agensi.io/skills/single-action-receipt-check)
- [AI Agent Outcome & Receipt Auditor](https://www.agensi.io/skills/ai-agent-outcome-receipt-auditor) — paid multi-outcome review.
- [AI Operations Evidence & Reliability Toolkit](https://www.agensi.io/bundles/ai-operations-evidence-reliability-toolkit) — paid four-skill bundle.
- [Revenue Assurance Suite](https://www.agensi.io/skills/revenue-assurance-suite) — separate paid offline financial toolkit.

Disclosure: these are our own products. The paid tools are optional and are not included in this repository. The free tool does not require a purchase, an Agensi account, or an external API.

## License

The free repository component may be used and adapted under the MIT license. This license does not cover any separately distributed paid products or third-party materials.
