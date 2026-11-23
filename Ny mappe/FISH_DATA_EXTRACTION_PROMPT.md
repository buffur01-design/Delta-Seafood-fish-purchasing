# Reusable fish-data extraction prompt

Copy the prompt below into Codex/ChatGPT and replace every value in square brackets.

```text
I need you to extract fisheries data from this new source file:

INPUT_FILE: [absolute or repository-relative path to the new file]
OUTPUT_FILE: [desired .json, .csv, .xlsx, or .sqlite output path]
DATE_OR_PERIOD: [date represented by the file, or "derive from file"]

Use `delta_fisheries_collector.py` in this repository as the reference implementation. First inspect that file and the input file, then implement and run the extraction. Reuse its existing parsing, number normalization, species/group handling, quality rules, and output conventions wherever applicable. Do not modify or overwrite the original input file or existing fisheries data unless I explicitly request it.

Required normalized fields:
- `date` in `YYYY-MM-DD` format
- `species` using the source's exact Faroese label
- `ship_group` using the source's exact label
- `quantity_kg` as a number
- `sales_value_dkk` as a number

If vessel-level data exists, also extract:
- `vessel`
- `identity` (registration/call-sign information available in the source)

Extraction rules:
1. Read the source structure; do not infer values from layout alone or invent missing data.
2. Parse Faroese/European numbers correctly: `1.234.567` means 1234567 and `1.234,50` means 1234.50. Preserve true decimal values.
3. Ignore report total/subtotal rows such as `Tils`, `Total`, `Sum`, or `Samlað` as observations. Use them only for validation.
4. Sum genuine duplicate observations only when they have the same date, species, ship group, and—when applicable—vessel identity.
5. Pair quantity and sales value by the complete record key, never by row position alone when separate tables/files are involved.
6. Mark a record `MATCHED` only when both quantity and sales value are present and quantity is positive. Use `NO_POSITIVE_KG` when quantity is zero or negative, and `UNMATCHED` when either metric is missing.
7. Include only `MATCHED` records with `quantity_kg > 0` in the public/clean output. Put rejected or ambiguous records in a separate review output or report them clearly; never silently discard them.
8. Validate row widths, headers, required keys, dates, numeric values, and totals where the source provides totals. Stop with a clear error if the layout is unrecognized.
9. Preserve Unicode correctly (UTF-8), including Faroese characters such as `ð`, `ø`, `á`, and `ý`. Do not produce mojibake such as `Ã°`.
10. Keep provenance for every record when the chosen format supports it: source filename/URL, quality flag, and extraction timestamp in UTC.

For JSON output, use this exact compact structure unless the target file already establishes another compatible schema:

{
  "updated_utc": "[ISO-8601 UTC timestamp]",
  "fields": ["date", "species", "ship_group", "quantity_kg", "sales_value_dkk"],
  "rows": [
    ["YYYY-MM-DD", "Species", "Ship group", 0.0, 0.0]
  ]
}

Sort output deterministically by date, species, ship group, and vessel (if present). Write the result only to `OUTPUT_FILE`.

After implementation:
- run the extraction;
- validate the generated file can be read back;
- report the number of matched and review records;
- show aggregate quantity and sales value totals;
- describe any assumptions or unsupported source features;
- list every file you created or changed.
```

If the new source has both quantity and value in one file, keep `INPUT_FILE` as written. If they are separate, replace it with `QUANTITY_FILE` and `VALUE_FILE` and require the records to be joined using the full normalized key.
