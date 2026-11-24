# Ops Automation Lab — free AI agent skills

Evidence-first tools for AI workflow owners and operations teams. The first skill checks whether a single expected action actually reached its destination.

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
