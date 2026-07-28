import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.promptMessage || body.contents?.[0]?.text || body.prompt || "";
    const columns = body.columns || [];

    const commands: any[] = [];
    let message = "I have processed your request.";
    const text = prompt.toLowerCase().trim();

    // Helper to convert camelCase to space-separated string ("employeeName" -> "employee name")
    const decamel = (str: string) =>
      str.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();

    // Helper to strip non-alphanumeric characters
    const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

    // Smart helper to find column by prompt text matching field, decamelized field, title or partial tokens
    const findColumn = (searchText: string) => {
      const cleanSearch = clean(searchText);
      const queryOnly = cleanSearch
        .replace(/\b(group by|sort by|filter by|order by|group|sort|filter|order|by|asc|desc|descending|ascending|clear|reset)\b/g, "")
        .trim();

      // First pass: try exact candidate matches
      for (const c of columns) {
        const field = String(c.field || "");
        const title = String(c.title || c.header || c.label || "");
        const decamelField = decamel(field);

        const candidates = [
          field.toLowerCase(),
          decamelField,
          decamelField.replace(/\s+/g, ""),
          title.toLowerCase(),
          title.toLowerCase().replace(/\s+/g, "")
        ].filter(Boolean);

        for (const cand of candidates) {
          if (
            (queryOnly && (queryOnly === cand || queryOnly.includes(cand) || cand.includes(queryOnly))) ||
            cleanSearch.includes(cand)
          ) {
            return c;
          }
        }
      }

      // Second pass: token overlap (e.g. "employee" matches "employeeName")
      const queryTokens = queryOnly.split(/\s+/).filter((t) => t.length > 1);
      if (queryTokens.length > 0) {
        for (const c of columns) {
          const field = String(c.field || "").toLowerCase();
          const title = String(c.title || c.header || c.label || "").toLowerCase();
          const combined = `${field} ${decamel(field)} ${title}`;
          if (queryTokens.some((token) => combined.includes(token))) {
            return c;
          }
        }
      }

      return undefined;
    };

    if (
      text.includes("clear") ||
      text.includes("reset") ||
      text.includes("remove") ||
      text.includes("original") ||
      text.includes("show all") ||
      text === "all"
    ) {
      commands.push(
        { type: "GridClearFilter", message: "Cleared filters." },
        { type: "GridClearSort", message: "Cleared sorting." },
        { type: "GridClearGroup", message: "Cleared grouping." }
      );
      message = "Cleared all filters, sorting, and grouping.";
    } else if (text.includes("group")) {
      const col = findColumn(text);
      if (col) {
        commands.push({
          type: "GridGroup",
          group: [{ field: col.field }],
          message: `Grouped by ${col.title || col.field}.`
        });
        message = `Grouped by ${col.title || col.field}.`;
      } else {
        message = "Could not find column to group by.";
      }
    } else if (
      text.includes("sort") ||
      text.includes("order") ||
      text.includes("arrange") ||
      text.includes("alphabetical")
    ) {
      const dir =
        text.includes("desc") ||
          text.includes("down") ||
          text.includes("reverse") ||
          text.includes("z to a") ||
          text.includes("highest") ||
          text.includes("newest")
          ? "desc"
          : "asc";
      let col = findColumn(text);
      if (!col) {
        if (text.includes("date") || text.includes("time")) col = columns.find((c: any) => c.field === "date");
        else if (text.includes("name") || text.includes("employee")) col = columns.find((c: any) => c.field === "employeeName" || c.field === "name");
        else if (text.includes("hours")) col = columns.find((c: any) => c.field === "hours");
      }
      if (col) {
        commands.push({
          type: "GridSort",
          sort: [{ field: col.field, dir }],
          message: `Sorted by ${col.title || col.field} in ${dir === "desc" ? "descending" : "ascending"} order.`
        });
        message = `Sorted by ${col.title || col.field} in ${dir === "desc" ? "descending" : "ascending"} order.`;
      } else {
        message = "Could not find column to sort by.";
      }
    } else {
      // Filter matching
      let filterMatched = false;

      // 1. First check unique values passed in column descriptors
      for (const col of columns) {
        if (col.values && Array.isArray(col.values)) {
          const matchedVal = col.values.find((val: any) => {
            if (val === null || val === undefined) return false;
            const strVal = String(val).toLowerCase();
            return text.includes(strVal);
          });

          if (matchedVal !== undefined) {
            commands.push({
              type: "GridFilter",
              filter: {
                logic: "and",
                filters: [
                  {
                    field: col.field,
                    operator: typeof matchedVal === "number" ? "eq" : "contains",
                    value: matchedVal
                  }
                ]
              },
              message: `Filtered by ${col.title || col.field} matching "${matchedVal}".`
            });
            message = `Filtered by ${col.title || col.field} matching "${matchedVal}".`;
            filterMatched = true;
            break;
          }
        }
      }

      // 2. Keyword fallback filters if values weren't matched directly
      if (!filterMatched) {
        if (text.includes("pending")) {
          const statusCol = columns.find((c: any) => c.field === "status");
          if (statusCol) {
            commands.push({
              type: "GridFilter",
              filter: {
                logic: "and",
                filters: [{ field: "status", operator: "contains", value: "Pending" }]
              },
              message: "Filtered by status containing Pending."
            });
            message = "Filtered by status containing Pending.";
            filterMatched = true;
          }
        } else if (text.includes("approved")) {
          const statusCol = columns.find((c: any) => c.field === "status");
          if (statusCol) {
            commands.push({
              type: "GridFilter",
              filter: {
                logic: "and",
                filters: [{ field: "status", operator: "eq", value: "Approved" }]
              },
              message: "Filtered by status Approved."
            });
            message = "Filtered by status Approved.";
            filterMatched = true;
          }
        } else if (text.includes("draft")) {
          const statusCol = columns.find((c: any) => c.field === "status");
          if (statusCol) {
            commands.push({
              type: "GridFilter",
              filter: {
                logic: "and",
                filters: [{ field: "status", operator: "eq", value: "Draft" }]
              },
              message: "Filtered by status Draft."
            });
            message = "Filtered by status Draft.";
            filterMatched = true;
          }
        } else if (prompt.trim()) {
          // Extract actual search term by cleaning natural language filler words
          const searchTerm = prompt
            .replace(/\b(filter|where|only|the|records|data|show|list|find|entries|matching|equal|equals|contains|by|is|for)\b/gi, "")
            .trim();

          const targetValue = searchTerm || prompt.trim();

          const textCols = columns.filter((c: any) => c.field !== "actions");
          if (textCols.length > 0 && targetValue) {
            const filterRules = textCols.map((c: any) => ({
              field: c.field,
              operator: "contains",
              value: targetValue
            }));
            commands.push({
              type: "GridFilter",
              filter: {
                logic: "or",
                filters: filterRules
              },
              message: `Filtered across columns matching "${targetValue}".`
            });
            message = `Filtered across columns matching "${targetValue}".`;
            filterMatched = true;
          }
        }
      }

      if (!filterMatched) {
        message = "I couldn't understand which filter, sort or group operation to apply. Try using suggestions like 'Filter status Approved' or 'Sort by date desc'.";
      }
    }

    return NextResponse.json({
      commands,
      message
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid AI request" }, { status: 400 });
  }
}
